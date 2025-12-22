import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  const { data, error } = await supabase.from('medication_information').select('*');
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data fetched successfully:", data);
  }
}

testConnection();
