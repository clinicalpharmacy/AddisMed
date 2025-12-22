import { v4 as uuidv4 } from "uuid";
import React, { useState, useEffect } from "react";
import supabase from "../utils/supabase";

const MedicationHistory = ({ patientCode }) => {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [formData, setFormData] = useState({
    drug_name: "",
    dose: "",
    roa: "po",
    frequency: "",
    start_date: "",
    stop_date: "",
    indication: "",
    initiated_at: "",
    drug_class: "Antimicrobial",
  });
  
  const roa = [
    "po",
    "SL",
    "IV",
    "IM",
    "SubQ",
    "IT",
    "Epidural",
    "Topical",
    "Ophthalmic",
    "Otic",
    "Nasal",
    "Inhalation",
    "Rectal",
    "PV",
    "NG/G Tube",
    "IP",
    "Other",
  ];
  
  const [selectedroa, setSelectedroa] = useState("");
  
  const [selectedClass, setSelectedClass] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const drugClasses = [
    "Antimicrobial",
    "Analgesics",
    "Anesthetics",
    "Anticonvulsant",
    "Antidepressant",
    "Anti-inflammatory",
    "Antineoplastic",
    "Antiparkinsonism",
    "Antipsychotic",
    "Antidiabetic",
    "Cardiovascular agent",
    "Dermatologic agent",
    "GI drug",
    "Hormonal agent",
    "Ophthalmologic agent",
    "Otic agent",
    "Respiratory agent",
    "Other",
  ];
  
  useEffect(() => {
    const fetchMedications = async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("medication_history")
        .eq("patient_code", patientCode)
        .single();

      if (error) {
        console.error("Error fetching medications:", error);
      } else {
        setMedications(data?.medication_history || []);
        setFilteredMedications(data?.medication_history || []);
      }
    };

    if (patientCode) fetchMedications();
  }, [patientCode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const calculateDuration = (startDate, stopDate) => {
  if (!startDate) return ""; // If no start date, return empty string.

  const start = new Date(startDate);
  const stop = stopDate ? new Date(stopDate) : new Date(); // Use current date if no stop date.

   // Add 1 day to stop to include it in duration
  stop.setDate(stop.getDate() + 1);

  // Calculate the difference in years, months, and days
  let years = stop.getFullYear() - start.getFullYear();
  let months = stop.getMonth() - start.getMonth();
  let days = stop.getDate() - start.getDate();

   if (days < 0) {
    months--;
    const prevMonth = new Date(stop.getFullYear(), stop.getMonth(), 0);
    days += prevMonth.getDate();
  }


  if (months < 0) {
    years--;
    months += 12; // Adjust the month count
  }

  // Format the result as a string
  return `${years} years, ${months} months, ${days} days`;
};

  
  const addMedication = async () => {
    const duration = calculateDuration(formData.start_date, formData.stop_date);
    const updatedFormData = { ...formData, duration, id: uuidv4() };

    const updatedMedications = [updatedFormData, ...medications];


    const { error } = await supabase
      .from("patients")
      .update({ medication_history: updatedMedications })
      .eq("patient_code", patientCode);

    if (error) {
      console.error("Error adding medication:", error);
    } else {
      setMedications(updatedMedications);
      setFilteredMedications(updatedMedications);
      setFormData({
        drug_name: "",
        dose: "",
        roa: "po",
        frequency: "",
        start_date: "",
        stop_date: "",
        indication: "",
        initiated_at: "",
        drug_class: "Antimicrobial",
      });
    }
  };

  const editMedication = async () => {
    const duration = calculateDuration(formData.start_date, formData.stop_date);

    const updatedMedications = medications.map((med) =>
      med.id === formData.id ? { ...formData, duration } : med
    );
    
    const { error } = await supabase
      .from("patients")
      .update({ medication_history: updatedMedications })
      .eq("patient_code", patientCode);

    if (error) {
      console.error("Error updating medication:", error);
    } else {
      setMedications(updatedMedications);
      setFilteredMedications(updatedMedications);
      setFormData({
        drug_name: "",
        dose: "",
        roa: "po",
        frequency: "",
        start_date: "",
        stop_date: "",
        indication: "",
        initiated_at: "",
        drug_class: "Antimicrobial",
      });
      setIsEditing(false);
      setEditingIndex(null);
    }
  };

  const handleClassFilter = (e) => {
    const classFilter = e.target.value;
    setSelectedClass(classFilter);

    if (classFilter === "") {
      setFilteredMedications(medications);
    } else {
      const filtered = medications.filter(
        (med) => med.drug_class === classFilter
      );
      setFilteredMedications(filtered);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl font-bold mb-4 text-center text-blue-600">Comprehensive Medication History</h2>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">{isEditing ? "Edit Medication" : "Add Medication"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            name="drug_name"
            placeholder="Drug Name"
            value={formData.drug_name}
            onChange={handleChange}
            className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <input
            type="text"
            name="dose"
            placeholder="Dose"
            value={formData.dose}
            onChange={handleChange}
            className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        
          <select
            name="roa"
            value={formData.roa}
            onChange={handleChange}
            className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            {roa.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            name="frequency"
            placeholder="Frequency"
            value={formData.frequency}
            onChange={handleChange}
            className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-1">End Date</label>
            <input
              type="date"
              name="stop_date"
              value={formData.stop_date}
              onChange={handleChange}
              className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <input
            type="text"
            name="indication"
            placeholder="Indication"
            value={formData.indication}
            onChange={handleChange}
            className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <input
            type="text"
            name="initiated_at"
            placeholder="Initiated At"
            value={formData.initiated_at}
            onChange={handleChange}
            className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />

        <select
            name="drug_class"
            value={formData.drug_class}
            onChange={handleChange}
            className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            {drugClasses.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={isEditing ? editMedication : addMedication}
          className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-colors w-full"
        >
          {isEditing ? "Save Changes" : "Add Medication"}
        </button>
      </div>

      <div className="flex justify-end mb-4">
        <label className="text-gray-600 text-sm mr-2">Filter by Class:</label>
        <select
          value={selectedClass}
          onChange={handleClassFilter}
          className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Classes</option>
          {drugClasses.map((drugClass) => (
            <option key={drugClass} value={drugClass}>
              {drugClass}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="border p-3">Drug Name</th>
              <th className="border p-3">Dose</th>
              <th className="border p-3">ROA</th>
              <th className="border p-3">Frequency</th>
              <th className="border p-3">Start Date</th>
              <th className="border p-3">Stop Date</th>
              <th className="border p-3">Duration</th>
              <th className="border p-3">Indication</th>
              <th className="border p-3">Initiated At</th>
              <th className="border p-3">Drug Class</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
        {[...filteredMedications]
          .sort((a, b) => new Date(b.stop_date || '2100-01-01') - new Date(a.stop_date || '2100-01-01'))
          .map((med, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                <td className="border p-3">{med.drug_name}</td>
                <td className="border p-3">{med.dose}</td>
                <td className="border p-3">{med.roa}</td>
                <td className="border p-3">{med.frequency}</td>
                <td className="border p-3">{med.start_date}</td>
                <td className="border p-3">{med.stop_date}</td>
                <td className="border p-3">{med.duration}</td>
                <td className="border p-3">{med.indication}</td>
                <td className="border p-3">{med.initiated_at}</td>
                <td className="border p-3">{med.drug_class}</td>
                <td className="border p-3">
                  <button
                    onClick={() => {
                      setFormData(med);; // now includes id
                      setIsEditing(true);
                      setEditingIndex(index); // no need for index now
                    }}
                    className="text-blue-500 hover:text-blue-700 mr-2"
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

export default MedicationHistory;
