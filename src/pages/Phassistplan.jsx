import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';

const Phassistplan = ({ patientCode }) => {
  const [phAsstPlan, setPhAsstPlan] = useState({});
  const [savedPlans, setSavedPlans] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // New state to track the index of the plan being edited

  useEffect(() => {
    const fetchAssessments = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('ph_asst_plan')
        .eq('patient_code', patientCode)
        .single();

      if (error) {
        console.error('Error fetching assessments:', error.message);
      } else {
        setSavedPlans(Array.isArray(data?.ph_asst_plan) ? data.ph_asst_plan : []);
      }
    };

    fetchAssessments();
  }, [patientCode]);

  const handlePhAsstPlanChange = (field, value) => {
    setPhAsstPlan((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const savePhAsstPlan = async () => {
    const timestamp = new Date().toISOString();
    const newEntry = { ...phAsstPlan, timestamp };

    const { data, error: fetchError } = await supabase
      .from('patients')
      .select('ph_asst_plan')
      .eq('patient_code', patientCode)
      .single();

    if (fetchError) {
      console.error('Error fetching existing plan:', fetchError.message);
      return;
    }

    let existingPlans = Array.isArray(data?.ph_asst_plan) ? data.ph_asst_plan : [];

    if (editIndex !== null) {
      // Update the existing plan
      existingPlans[editIndex] = newEntry;
    } else {
      // Add new plan
      existingPlans = [...existingPlans, newEntry];
    }

    const { error: updateError } = await supabase
      .from('patients')
      .update({ ph_asst_plan: existingPlans })
      .eq('patient_code', patientCode);

    if (updateError) {
      console.error('Error saving data:', updateError.message);
    } else {
      alert('Pharmacy Assessment and Plan saved successfully!');
      setSavedPlans(existingPlans);
      setPhAsstPlan({});
      setEditIndex(null); // Reset the edit index after saving
    }
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    const planToEdit = savedPlans[index];
    setPhAsstPlan({ phAsst: planToEdit.phAsst, plan: planToEdit.plan });
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center p-6">     
      {/* Pharmacy Assessment & Plan Input Form */}
      <div className="mt-6 bg-white p-6 shadow-lg rounded-lg w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Pharmacy Assessment & Plan</h2>
        <textarea
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
          placeholder="Pharmacy Assessment"
          value={phAsstPlan['phAsst'] || ''}
          onChange={(e) => handlePhAsstPlanChange('phAsst', e.target.value)}
        />
        <textarea
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
          placeholder="Plan"
          value={phAsstPlan['plan'] || ''}
          onChange={(e) => handlePhAsstPlanChange('plan', e.target.value)}
        />
        <button
          onClick={savePhAsstPlan}
          className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors w-full"
        >
          {editIndex !== null ? 'Save Changes' : 'Save Pharmacy Assessment & Plan'}
        </button>
      </div>

      {/* Saved Pharmacy Assessment & Plan Table */}
      <div className="mt-6 bg-white p-6 shadow-lg rounded-lg w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Saved Pharmacy Assessment & Plan</h2>
        <table className="w-full border-collapse border border-gray-300 mt-2">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="border border-gray-300 p-3">Pharmacy Assessment</th>
              <th className="border border-gray-300 p-3">Plan</th>
              <th className="border border-gray-300 p-3">Timestamp</th>
              <th className="border border-gray-300 p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {savedPlans.map((plan, index) => (
              <tr key={index} className="text-center hover:bg-gray-100">
                <td className="border p-3">{plan.phAsst}</td>
                <td className="border p-3">{plan.plan}</td>
                <td className="border p-3">{new Date(plan.timestamp).toLocaleString()}</td>
                <td className="border p-3">
                  <button
                    onClick={() => handleEditClick(index)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mr-2"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Phassistplan;
