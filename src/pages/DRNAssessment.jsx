import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const menuItemsData = {
  Indication: [
    { name: 'Duplicate Therapy', "DTP Type": 'Unnecessary Drug Therapy', drn: 'Indication' },
    { name: 'No medical indication', "DTP Type": 'Unnecessary Drug Therapy', drn: 'Indication' },
    { name: 'Nondrug therapy appropriate', "DTP Type": 'Unnecessary Drug Therapy', drn: 'Indication' },
    { name: 'Addiction or recreational medicine use', "DTP Type": 'Unnecessary Drug Therapy', drn: 'Indication' },
    { name: 'Treating avoidable ADE', "DTP Type": 'Unnecessary Drug Therapy', drn: 'Indication' },
    { name: 'Prophylaxis needed', "DTP Type": 'Needs Additional Drug Therapy', drn: 'Indication' },
    { name: 'Untreated condition', "DTP Type": 'Needs Additional Drug Therapy', drn: 'Indication' },
    { name: 'Synergistic therapy needed', "DTP Type": 'Needs Additional Drug Therapy', drn: 'Indication' },
  ],
  Dosage: [
    { name: 'Low Dose', "DTP Type": 'Low Dose', drn: 'Effectiveness' },
    { name: 'Less Frequent', "DTP Type": 'Low Dose', drn: 'Effectiveness' },
    { name: 'Short Duration', "DTP Type": 'Low Dose', drn: 'Effectiveness' },
    { name: 'Improper Storage', "DTP Type": 'Low Dose', drn: 'Effectiveness' },
    { name: 'High Dose', "DTP Type": 'High Dose', drn: 'Safety' },
    { name: 'More Frequent', "DTP Type": 'High Dose', drn: 'Safety' },
    { name: 'Longer Duration', "DTP Type": 'High Dose', drn: 'Safety' },
    { name: 'Dose Titration Slow or Fast', "DTP Type": 'ADE', drn: 'Safety' },
  ],
  "Rule out Ineffective Drug Therapy": [
    { name: 'More effective drug available', "DTP Type": 'Ineffective Drug Therapy', drn: 'Effectiveness' },
    { name: 'Condition refractory to drug', "DTP Type": 'Ineffective Drug Therapy', drn: 'Effectiveness' },
    { name: 'Dosage form inappropriate', "DTP Type": 'Ineffective Drug Therapy', drn: 'Effectiveness' },
  ],
  "Contraindication or Caution or ADE or SE or Allergy": [
    { name: 'Undesirable Effect (ADE or SE)', "DTP Type": 'ADE', drn: 'Safety' },
    { name: 'Unsafe Drug (Contraindication or Caution)', "DTP Type": 'ADE', drn: 'Safety' },
    { name: 'Allergic Reaction', "DTP Type": 'ADE', drn: 'Safety' },
  ],
  "Drug Interaction": [
    { name: 'DI increase dose', "DTP Type": 'High Dose', drn: 'Safety' },
    { name: 'DI decrease dose', "DTP Type": 'Low Dose', drn: 'Effectiveness' },
    { name: 'DI linked to ADE', "DTP Type": 'ADE', drn: 'Safety' },
  ],
  Administration: [
    { name: 'Incorrect administration decrease dose or efficacy', "DTP Type": 'Low Dose', drn: 'Effectiveness' },
    { name: 'Incorrect administration linked to ADE', "DTP Type": 'ADE', drn: 'Safety' },
    { name: 'Patient does not understand instructions', "DTP Type": 'Non-Adherence', drn: 'Adherence' },
    { name: 'Cannot swallow or administer drug', "DTP Type": 'Non-Adherence', drn: 'Adherence' },
  ],
  Monitoring: [
    { name: 'Need Monitoring to rule out effectiveness', "DTP Type": 'Needs additional monitoring', drn: 'Effectiveness' },
    { name: 'Need Monitoring to rule out safety', "DTP Type": 'Needs additional monitoring', drn: 'Safety' },
  ],
  Adherence: [
    { name: 'Patient prefers not to take drug', "DTP Type": 'Non-Adherence', drn: 'Adherence' },
    { name: 'Patient forgets to take drug', "DTP Type": 'Non-Adherence', drn: 'Adherence' },
    { name: 'Drug not available', "DTP Type": 'Non-Adherence', drn: 'Adherence' },
    { name: 'More cost-effective drug available', "DTP Type": 'Cost', drn: 'Adherence' },
    { name: 'Cannot afford drug', "DTP Type": 'Cost', drn: 'Adherence' },
  ],
  "Product Quality": [
    { name: 'Product Quality Defect', "DTP Type": 'Product Quality Defect', drn: 'Product Quality' },
  ],
};

const DrnAssessment = ({ patientCode }) => {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedDTPCause, setSelectedDTPCause] = useState([]);
  const [writeUps, setWriteUps] = useState({});
  const [timestamps, setTimestamps] = useState({});
  const [isReportable, setIsReportable] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [showReportablePopup, setShowReportablePopup] = useState(false);
  const [reportableDTPCause, setReportableDTPCause] = useState(null);
  const [showDefectLink, setShowDefectLink] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*, medication_history')
        .eq('patient_code', patientCode)
        .single();

      if (!error) {
        setPatientData(data);
        setMedicationHistory(data.medication_history || []);
        
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('patients')
          .select('drn_assessment')
          .eq('patient_code', patientCode)
          .single();

        if (!assessmentError) {
          setAssessments(assessmentData?.drn_assessment || []);
        }
      }
    };

    fetchData();
  }, [patientCode]);

  const analyzeWithAI = () => {
    setIsAnalyzing(true);
    setShowAnalysisResults(true);
    
    setTimeout(() => {
      if (!patientData || medicationHistory.length === 0) {
        setAiAnalysis({
          summary: "Insufficient data for analysis",
          details: "Please ensure patient data and medication history are available",
          detectedDTPs: []
        });
      } else {
        const detected = [];
        
        medicationHistory.forEach(med => {
          if (med.drug_class === 'Antimicrobial' && !med.stop_date) {
            detected.push({
              cause: "Longer Duration",
              evidence: `${med.drug_name} has extended duration (IDSA Guideline)`,
              category: "Dosage"
            });
          }
          
          if (med.drug_class === 'NSAID' && patientData.age > 65) {
            detected.push({
              cause: "Unsafe Drug",
              evidence: `${med.drug_name} use in elderly patient (Beers Criteria)`,
              category: "Contraindication or Caution or ADE or SE or Allergy"
            });
          }
        });

        setAiAnalysis({
          summary: detected.length > 0 ? `${detected.length} potential DTP Cause(s) detected` : "No critical issues found",
          detectedDTPs: detected,
          lastUpdated: new Date().toLocaleString()
        });
      }
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleDTPCauseChange = (DTPCauseName) => {
    setSelectedDTPCause((prev) =>
      prev.includes(DTPCauseName) ? prev.filter((item) => item !== DTPCauseName) : [...prev, DTPCauseName]
    );
    setTimestamps((prev) => ({
      ...prev,
      [DTPCauseName]: new Date().toISOString(),
    }));
  };

  const handleWriteUpChange = (DTPCauseName, field, value) => {
    setWriteUps((prev) => ({
      ...prev,
      [DTPCauseName]: { ...prev[DTPCauseName], [field]: value },
    }));
    setTimestamps((prev) => ({
      ...prev,
      [DTPCauseName]: new Date().toISOString()
    }));
  };

  const saveAssessment = async (DTPCauseName) => {
    const DTPCauseData = writeUps[DTPCauseName];
    if (!DTPCauseData || !DTPCauseData["DTP Cause"] || !DTPCauseData["medical condition"] || !DTPCauseData.medication) {
      alert('Please fill in all required fields before saving.');
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('patients')
      .select('drn_assessment')
      .eq('patient_code', patientCode)
      .single();

    if (fetchError) {
      console.error('Error fetching data:', fetchError.message);
      return;
    }

    const existingAssessments = Array.isArray(data?.drn_assessment) ? data.drn_assessment : [];

    if (!selectedMenu) {
      alert("Please select a category before saving.");
      return;
    }
    const selectedDTPCauseDetails = menuItemsData[selectedMenu]?.find(c => c.name === DTPCauseName);

    const newAssessment = {
      DTPCauseName,
      "DTP Type": selectedDTPCauseDetails?.["DTP Type"],
      drn: selectedDTPCauseDetails?.drn,
      "Specific Case": writeUps[DTPCauseName]?.["DTP Cause"],
      "medical condition": writeUps[DTPCauseName]?.["medical condition"],
      medication: writeUps[DTPCauseName]?.medication,
      timestamp: timestamps[DTPCauseName] || new Date().toISOString(),
      isReportable
    };

    const updatedAssessments = editingIndex !== null
      ? existingAssessments.map((assessment, index) =>
          index === editingIndex ? newAssessment : assessment
        )
      : [...existingAssessments, newAssessment];

    const { error } = await supabase
      .from('patients')
      .update({ drn_assessment: updatedAssessments })
      .eq('patient_code', patientCode);

    if (error) {
      console.error('Error saving data:', error.message);
    } else {
      setAssessments(updatedAssessments);
      setEditingIndex(null);
      if (selectedDTPCauseDetails?.["DTP Type"] === 'ADE' || DTPCauseName === 'Product Quality Defect') {
        setShowReportablePopup(true);
        setReportableDTPCause(DTPCauseName);
      }
    }
  };

  const editAssessment = (index) => {
    const assessmentToEdit = assessments[index];
    const foundCategory = Object.keys(menuItemsData).find(category =>
      menuItemsData[category].some(cause => cause.name === assessmentToEdit.DTPCauseName)
    );

    if (foundCategory) {
      setSelectedMenu(foundCategory);
    }

    setWriteUps({
      [assessmentToEdit.DTPCauseName]: {
        "DTP Cause": assessmentToEdit["Specific Case"],
        "specific Case": assessmentToEdit["specific case"],
        "medical condition": assessmentToEdit["medical condition"],
        medication: assessmentToEdit.medication,
      }
    });

    setSelectedDTPCause([assessmentToEdit.DTPCauseName]);
    setEditingIndex(index);
  };

  const selectedMenuDTPCauses = menuItemsData[selectedMenu] || [];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen flex p-8">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-4 gap-8">
        <div className="col-span-1">
          <div className="bg-white p-4 shadow-lg rounded-xl h-full sticky top-8">
            {Object.keys(menuItemsData).map((item) => (
              <button
                key={item}
                onClick={() => setSelectedMenu(item)}
                className={`w-full px-4 py-2 mb-2 rounded-lg transition-all duration-300 ${
                  selectedMenu === item ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 hover:bg-blue-100'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-3">
          <h1 className="text-xl font-bold mb-4 text-blue-600">Drug-related Need Assessment Activity</h1>

          {/* AI Analysis Section with Toggle */}
          <div className="bg-white p-6 mb-6 rounded-xl shadow-lg border border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-800">AI DRN Assessment</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAnalysisResults(!showAnalysisResults)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FontAwesomeIcon icon={showAnalysisResults ? faChevronUp : faChevronDown} />
                  <span className="ml-2">{showAnalysisResults ? 'Hide Results' : 'Show Results'}</span>
                </button>
                <button
                  onClick={analyzeWithAI}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                </button>
              </div>
            </div>

            {showAnalysisResults && (
              <>
                {isAnalyzing ? (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span>Analyzing {medicationHistory.length} medications...</span>
                    </div>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${
                      aiAnalysis.detectedDTPs.length > 0 ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'
                    }`}>
                      <p className="font-medium">
                        {aiAnalysis.summary}
                        {aiAnalysis.details && <span className="block text-sm mt-1">{aiAnalysis.details}</span>}
                      </p>
                    </div>

                    {aiAnalysis.detectedDTPs.map((dtp, index) => (
                      <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-yellow-800">{dtp.cause}</h3>
                            <p className="text-sm text-gray-700 mt-1">{dtp.evidence}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedMenu(dtp.category);
                              setSelectedDTPCause([dtp.cause]);
                            }}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded hover:bg-yellow-200"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-600">
                    <p>No analysis performed yet</p>
                    <p className="text-sm mt-1">Analyzed data will appear here</p>
                  </div>
                )}
              </>
            )}
          </div>

          {selectedMenu && (
            <div className="bg-white p-8 shadow-lg rounded-xl">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">DTP Causes</h2>

              <div className="grid grid-cols-3 gap-4 mt-4">
                {menuItemsData[selectedMenu].map(({ name }) => (
                  <div key={name} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={name}
                      onChange={() => handleDTPCauseChange(name)}
                      checked={selectedDTPCause.includes(name)}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-gray-700">{name}</label>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-6">
                {selectedDTPCause.map((name) => {
                  const DTPCauseData = menuItemsData[selectedMenu].find(c => c.name === name);
                  return (
                    <div key={name} className="p-6 border rounded-lg bg-gray-50 shadow-md">
                      <p className="text-gray-700"><strong>"DTP Type":</strong> {DTPCauseData?.["DTP Type"]}</p>
                      <p className="text-gray-700"><strong>DRN:</strong> {DTPCauseData?.drn}</p>

                      <label className="block mb-2 text-gray-700">Specific Case</label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={writeUps[name]?.["DTP Cause"] || ''}
                        onChange={(e) => handleWriteUpChange(name, "DTP Cause", e.target.value)}
                        required
                      />

                      <label className="block mt-4 mb-2 text-gray-700">Medical Condition</label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={writeUps[name]?.['medical condition'] || ''}
                        onChange={(e) => handleWriteUpChange(name, "medical condition", e.target.value)}
                        required
                      />

                      <label className="block mt-4 mb-2 text-gray-700">Medication</label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-blue-500"
                        value={writeUps[name]?.medication || ''}
                        onChange={(e) => handleWriteUpChange(name, 'medication', e.target.value)}
                        required
                      />

                      <button
                        onClick={() => saveAssessment(name)}
                        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                      >
                        Save {name}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isReportable && (
            <div className="mt-8 p-6 bg-blue-100 rounded-lg text-blue-800 shadow-md">
              <p>This case is reportable. Please submit the report at: <a href="https://primaryreporting.who-umc.org/ET" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-700">EFDA ADE Report</a></p>
            </div>
          )}

          <div className="mt-8 bg-white p-6 shadow-lg rounded-xl">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Saved Assessments</h2>
            <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-blue-100 text-gray-800">
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Specific Case</th>
                  <th className="px-4 py-2">DTP Type</th>
                  <th className="px-4 py-2">Medical Condition</th>
                  <th className="px-4 py-2">Medication</th>
                  <th className="px-4 py-2">Timestamp</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assessment, index) => (
                  <tr key={index} className="text-center hover:bg-gray-50 transition-all duration-200">
                    <td className="px-4 py-2 border-t">{assessment["Specific Case"]}</td>
                    <td className="px-4 py-2 border-t">{assessment["DTP Type"]}</td>
                    <td className="px-4 py-2 border-t">{assessment["medical condition"]}</td>
                    <td className="px-4 py-2 border-t">{assessment.medication}</td>
                    <td className="px-4 py-2 border-t">{assessment.timestamp ? new Date(assessment.timestamp).toLocaleString() : 'N/A'}</td>
                    <td className="px-4 py-2 border-t flex space-x-2">
                      <button
                            onClick={() => editAssessment(index)}
                            className="text-blue-500 hover:text-blue-700 transition-all duration-300"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showReportablePopup && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-10 rounded-xl shadow-lg">
            <p className="mb-8 text-gray-700 text-lg">Is it reportable?</p>
            <div className="flex gap-6">
              <button
                onClick={() => { setIsReportable(true); setShowReportablePopup(false); }}
                className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
              >
                Yes
              </button>
              <button
                onClick={() => { setIsReportable(false); setShowReportablePopup(false); }}
                className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrnAssessment;
