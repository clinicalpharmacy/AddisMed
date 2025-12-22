import { glob } from 'glob';
import fs from 'fs-extra';
import path from 'path';

// Output SQL file
const outputDir = path.join(process.cwd(), 'sql');
await fs.ensureDir(outputDir);
const outputFile = path.join(outputDir, 'schema_supabase_ready.sql');

// Store table definitions and functions
const tables = {};
const functions = new Set();

// Helper: parse object fields and guess types
function extractFieldsWithTypes(objStr) {
  const result = {};
  try {
    const str = objStr
      .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":') // convert keys to JSON keys
      .replace(/'/g, '"'); // convert single quotes
    const obj = JSON.parse(str);
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === 'string') result[key] = 'text';
      else if (typeof val === 'number') result[key] = 'integer';
      else if (typeof val === 'boolean') result[key] = 'boolean';
      else if (Array.isArray(val) || typeof val === 'object') result[key] = 'jsonb';
      else result[key] = 'text';
    }
  } catch (e) {
    // fallback if parsing fails
  }
  return result;
}

// Scan all JS/TS files
glob('**/*.{js,ts,jsx,tsx}', { ignore: 'node_modules/**' }, async (err, files) => {
  if (err) throw err;

  console.log(`Found ${files.length} files. Scanning for tables and functions...`);

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');

    // --- TABLE DETECTION ---
    const tableRegex = /\.from\(['"`](.*?)['"`]\)/g;
    let match;
    while ((match = tableRegex.exec(content)) !== null) {
      const tableName = match[1];
      if (!tables[tableName]) tables[tableName] = {};

      // Insert fields
      const insertRegex = new RegExp(`\\.from\\(['"\`]${tableName}['"\`]\\)\\.insert\\((\\{[\\s\\S]*?\\})\\)`, 'g');
      let insertMatch;
      while ((insertMatch = insertRegex.exec(content)) !== null) {
        const fields = extractFieldsWithTypes(insertMatch[1]);
        Object.assign(tables[tableName], fields);
      }

      // Update fields
      const updateRegex = new RegExp(`\\.from\\(['"\`]${tableName}['"\`]\\)\\.update\\((\\{[\\s\\S]*?\\})\\)`, 'g');
      let updateMatch;
      while ((updateMatch = updateRegex.exec(content)) !== null) {
        const fields = extractFieldsWithTypes(updateMatch[1]);
        Object.assign(tables[tableName], fields);
      }

      // Ensure user_id column exists for RLS if table is not 'users'
      if (tableName !== 'users' && !tables[tableName]['user_id']) {
        tables[tableName]['user_id'] = 'uuid';
      }
    }

    // --- FUNCTION DETECTION ---
    const rpcRegex = /\.rpc\(['"`](.*?)['"`]\)/g;
    let rpcMatch;
    while ((rpcMatch = rpcRegex.exec(content)) !== null) {
      functions.add(rpcMatch[1]);
    }
  }

  // --- GENERATE SQL ---
  let sql = '-- SUPABASE-READY SCHEMA GENERATED FROM CODE\n\n';

  for (const table of Object.keys(tables)) {
    sql += `CREATE TABLE ${table} (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n`;

    for (const [col, type] of Object.entries(tables[table])) {
      sql += `  ${col} ${type},\n`;
    }
    sql = sql.trim().slice(0, -1); // remove last comma
    sql += '\n);\n\n';

    // Enable RLS
    sql += `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;\n\n`;

    // Table-specific RLS
    if (table === 'users') {
      sql += `CREATE POLICY "Users can view/update their profile" ON users\n  FOR ALL USING (auth.uid() = auth_uid);\n\n`;
    } else {
      sql += `CREATE POLICY "${table}_select" ON ${table}\n  FOR SELECT USING (user_id = auth.uid());\n\n`;
      sql += `CREATE POLICY "${table}_insert" ON ${table}\n  FOR INSERT WITH CHECK (user_id = auth.uid());\n\n`;
      sql += `CREATE POLICY "${table}_update" ON ${table}\n  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());\n\n`;
      sql += `CREATE POLICY "${table}_delete" ON ${table}\n  FOR DELETE USING (user_id = auth.uid());\n\n`;
    }
  }

  // Functions
  if (functions.size) {
    sql += '-- Placeholder functions detected from .rpc() calls\n';
    for (const func of functions) {
      sql += `CREATE OR REPLACE FUNCTION ${func}() RETURNS void AS $$\nBEGIN\n  -- TODO: implement logic\nEND;\n$$ LANGUAGE plpgsql;\n\n`;
    }
  }

  await fs.writeFile(outputFile, sql);
  console.log(`Supabase-ready SQL generated at: ${outputFile}`);
});
