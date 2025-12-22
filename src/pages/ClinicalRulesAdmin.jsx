import React, { useState, useEffect, useCallback } from 'react';
import supabase from '../utils/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faSearch,
  faToggleOn,
  faToggleOff,
  faCopy,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

const ClinicalRulesAdmin = ({ onClose, onRuleSaved }) => {
  const [rules, setRules] = useState([]);
  const [filteredRules, setFilteredRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);

  const [formData, setFormData] = useState({
    rule_name: '',
    rule_description: '',
    rule_type: 'Indication',
    rule_condition: JSON.stringify(
      {
        type: '',
        condition: '',
        threshold: '',
        comparator: '',
        drugs: [],
        labs: [],
        patientCriteria: {},
        duration: {},
        interactionType: ''
      },
      null,
      2
    ),
    rule_action: '',
    created_by: 'ClinicalRulesAdmin',
    is_active: true
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showJSONEditor, setShowJSONEditor] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [templateExamples, setTemplateExamples] = useState([]);

  const ruleTypes = [
    'Indication',
    'Dosage',
    'Rule out Ineffective Drug',
    'Contraindication/Caution/ADE/Side Effect/Allergy',
    'Drug_Interaction',
    'Administration',
    'Monitoring',
    'Adherence',
    'Product_Quality'
  ];

  /* =========================
     Fetch Rules
  ========================== */
  const fetchRules = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('clinical_rules')
      .select('*')
      .order('created_date', { ascending: false });

    if (!showInactive) query = query.eq('is_active', true);

    const { data, error } = await query;

    if (!error) {
      setRules(data || []);
      filterRules(data || [], searchTerm);
    } else {
      console.error('Error fetching rules:', error);
    }

    setLoading(false);
  }, [searchTerm, showInactive]);

  useEffect(() => {
    fetchRules();
    loadTemplateExamples();
  }, [fetchRules]);

  /* =========================
     Templates
  ========================== */
  const loadTemplateExamples = () => {
    setTemplateExamples([
      {
        name: 'NSAID in Elderly',
        type: 'Contraindication/Caution/ADE/Side Effect/Allergy',
        condition: {
          type: 'patient_age_drug',
          condition: 'age > 65 AND drug_class = NSAID',
          drugs: ['NSAIDs'],
          patientCriteria: { age: { min: 65 } },
          message: 'Potential drug-related problem: NSAID use in elderly patients'
        }
      },
      {
        name: 'Renal Dose Adjustment',
        type: 'Dosage',
        condition: {
          type: 'lab_value_drug',
          condition: 'SCr > 1.5 AND drug_class = Antibiotic',
          labs: [{ name: 'SCr', comparator: '>', threshold: 1.5 }],
          drugs: ['Gentamicin', 'Vancomycin'],
          message: 'Potential drug-related problem: renal impairment requires dose adjustment'
        }
      }
    ]);
  };

  /* =========================
     Filtering
  ========================== */
  const filterRules = (rulesList, search) => {
    const filtered = rulesList.filter(rule =>
      rule.rule_name.toLowerCase().includes(search.toLowerCase()) ||
      rule.rule_description.toLowerCase().includes(search.toLowerCase()) ||
      rule.rule_type.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredRules(filtered);
  };

  /* =========================
     Validation
  ========================== */
  const validateRule = () => {
    const errors = [];

    if (!formData.rule_name.trim()) {
      errors.push('Rule name is required');
    }

    if (!formData.rule_description.trim()) {
      errors.push('Rule description is required');
    }

    try {
      const cond = JSON.parse(formData.rule_condition);
      if (!cond.type || !cond.condition) {
        errors.push('Rule condition must include "type" and "condition"');
      }
    } catch {
      errors.push('Invalid JSON format in rule condition');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  /* =========================
     Save / Update
  ========================== */
  const handleSaveRule = async () => {
    if (!validateRule()) {
      alert('Please fix validation errors before saving.');
      return;
    }

    const ruleData = {
      ...formData,
      rule_condition: JSON.parse(formData.rule_condition)
    };

    try {
      let error;

      if (editingRule) {
        const { error: updateError } = await supabase
          .from('clinical_rules')
          .update(ruleData)
          .eq('id', editingRule.id);

        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('clinical_rules')
          .insert([{ ...ruleData, id: `rule_${Date.now()}` }]);

        error = insertError;
      }

      if (error) throw error;

      resetForm();
      fetchRules();
      onRuleSaved && onRuleSaved();

      alert(editingRule ? 'Rule updated successfully!' : 'Rule created successfully!');
    } catch (e) {
      console.error(e);
      alert('Error saving rule.');
    }
  };

  /* =========================
     Edit / Activate / Deactivate
  ========================== */
  const handleEditRule = rule => {
    setEditingRule(rule);
    setFormData({
      ...rule,
      rule_condition: JSON.stringify(rule.rule_condition, null, 2)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeactivateRule = async ruleId => {
    if (!window.confirm('Deactivate this rule?')) return;

    await supabase
      .from('clinical_rules')
      .update({ is_active: false })
      .eq('id', ruleId);

    fetchRules();
  };

  const handleActivateRule = async ruleId => {
    await supabase
      .from('clinical_rules')
      .update({ is_active: true })
      .eq('id', ruleId);

    fetchRules();
  };

  const handleUseTemplate = template => {
    setFormData({
      ...formData,
      rule_name: template.name,
      rule_type: template.type,
      rule_condition: JSON.stringify(template.condition, null, 2),
      rule_description: template.condition.message || ''
    });
  };

  const resetForm = () => {
    setFormData({
      rule_name: '',
      rule_description: '',
      rule_type: 'Indication',
      rule_condition: JSON.stringify(
        {
          type: '',
          condition: '',
          threshold: '',
          comparator: '',
          drugs: [],
          labs: [],
          patientCriteria: {},
          duration: {},
          interactionType: ''
        },
        null,
        2
      ),
      rule_action: '',
      created_by: 'ClinicalRulesAdmin',
      is_active: true
    });

    setEditingRule(null);
    setValidationErrors([]);
  };

  /* =========================
     UI
  ========================== */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="relative top-16 mx-auto p-5 w-full max-w-5xl bg-white rounded-xl shadow-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-blue-800">
            Clinical Rules Administration
          </h2>
          <button onClick={onClose} className="text-gray-500 text-2xl">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Form */}
        <h3 className="font-semibold text-lg mb-3">
          {editingRule ? 'Edit Rule' : 'Create New Rule'}
        </h3>

        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <ul className="list-disc pl-5 text-red-700">
              {validationErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input
            placeholder="Rule Name *"
            className="border p-2 rounded"
            value={formData.rule_name}
            onChange={e => setFormData({ ...formData, rule_name: e.target.value })}
          />

          <select
            className="border p-2 rounded"
            value={formData.rule_type}
            onChange={e => setFormData({ ...formData, rule_type: e.target.value })}
          >
            {ruleTypes.map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <textarea
          rows={3}
          className="border p-2 rounded w-full mb-4"
          placeholder="Rule description * (there is a potential drug-related problem)"
          value={formData.rule_description}
          onChange={e =>
            setFormData({ ...formData, rule_description: e.target.value })
          }
        />

        {/* JSON */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <label className="font-medium">Rule Condition (JSON)</label>
            <button
              onClick={() => setShowJSONEditor(!showJSONEditor)}
              className="text-blue-600"
            >
              <FontAwesomeIcon icon={showJSONEditor ? faEyeSlash : faEye} />{' '}
              {showJSONEditor ? 'Hide' : 'Show'}
            </button>
          </div>

          {showJSONEditor ? (
            <textarea
              rows={10}
              className="border p-2 rounded w-full font-mono text-sm"
              value={formData.rule_condition}
              onChange={e =>
                setFormData({ ...formData, rule_condition: e.target.value })
              }
            />
          ) : (
            <pre className="bg-gray-50 p-2 rounded text-sm max-h-32 overflow-auto">
              {formData.rule_condition}
            </pre>
          )}
        </div>

        {/* Templates */}
        <div className="bg-gray-50 p-3 rounded mb-4">
          <h4 className="font-medium mb-2">Quick Templates</h4>
          <div className="flex flex-wrap gap-2">
            {templateExamples.map((t, i) => (
              <button
                key={i}
                onClick={() => handleUseTemplate(t)}
                className="border bg-white px-3 py-1 rounded hover:bg-blue-50"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={handleSaveRule}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            <FontAwesomeIcon icon={faSave} />{' '}
            {editingRule ? 'Update' : 'Create'}
          </button>
          {editingRule && (
            <button onClick={resetForm} className="border px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>

        {/* Rule List */}
        <div className="border-t pt-4">
          <div className="flex gap-2 mb-3">
            <input
              className="border p-2 rounded w-full max-w-md"
              placeholder="Search rules..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                filterRules(rules, e.target.value);
              }}
            />
            <button
              onClick={() => setShowInactive(!showInactive)}
              className="border px-3 rounded"
            >
              <FontAwesomeIcon icon={showInactive ? faToggleOn : faToggleOff} />{' '}
              Inactive
            </button>
          </div>

          {loading ? (
            <p>Loading…</p>
          ) : filteredRules.length === 0 ? (
            <p>No rules found</p>
          ) : (
            filteredRules.map(rule => (
              <div
                key={rule.id}
                className={`p-3 border rounded mb-2 ${
                  rule.is_active ? '' : 'opacity-60 bg-gray-50'
                }`}
              >
                <h4 className="font-medium">{rule.rule_name}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {rule.rule_description}
                </p>

                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRule(rule)}
                      className="text-blue-600 text-sm"
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button
                      onClick={() =>
                        setFormData({
                          ...rule,
                          rule_name: `${rule.rule_name} (Copy)`,
                          rule_condition: JSON.stringify(
                            rule.rule_condition,
                            null,
                            2
                          )
                        })
                      }
                      className="text-green-600 text-sm"
                    >
                      <FontAwesomeIcon icon={faCopy} /> Duplicate
                    </button>
                  </div>

                  {rule.is_active ? (
                    <button
                      onClick={() => handleDeactivateRule(rule.id)}
                      className="text-red-600 text-sm"
                    >
                      <FontAwesomeIcon icon={faTrash} /> Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivateRule(rule.id)}
                      className="text-green-600 text-sm"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalRulesAdmin;
