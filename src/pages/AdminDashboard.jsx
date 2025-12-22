import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaDatabase, FaExclamationTriangle, FaPills, FaEdit, FaTrash, FaHome, FaStethoscope, FaFlask } from "react-icons/fa";
import supabase from "../utils/supabase";
import AppointmentsTable from "./AppointmentsTable";
import NumberOfPatientsDashboard from "./NumberOfPatientsDashboard";
import PharmacistDashboardCharts from "./PharmacistDashboardCharts";

console.log("Supabase URL:", process.env.REACT_APP_SUPABASE_URL);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [agreementText, setAgreementText] = useState("");
  const [message, setMessage] = useState("");
  const [resourceLinks, setResourceLinks] = useState([]);
  const [medicationInformation, setMedicationInformation] = useState([]);
  const [homeRemedies, setHomeRemedies] = useState([]);
  const [minorIllnesses, setMinorIllnesses] = useState([]);
  const [extemporaneousPreparations, setExtemporaneousPreparations] = useState([]);
  const [reports, setReports] = useState([]);
  const [patientCounts, setPatientCounts] = useState({});
  const [selectedPharmacist, setSelectedPharmacist] = useState("");
  const [editingLinkId, setEditingLinkId] = useState(null);
  const [editingMedicationId, setEditingMedicationId] = useState(null);
  const [editingHomeRemedyId, setEditingHomeRemedyId] = useState(null);
  const [editingMinorIllnessId, setEditingMinorIllnessId] = useState(null);
  const [editingExtemporaneousPreparationId, setEditingExtemporaneousPreparationId] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Medication form fields
  const [medicationName, setMedicationName] = useState("");
  const [amharicMedicationName, setamharicMedicationName] = useState("");
  const [usage, setUsage] = useState("");
  const [beforeTaking, setBeforeTaking] = useState("");
  const [whileTaking, setWhileTaking] = useState("");
  const [sideEffects, setSideEffects] = useState("");
  const [seriousSideEffects, setSeriousSideEffects] = useState("");
  const [howToTake, setHowToTake] = useState("");
  const [missedDose, setMissedDose] = useState("");
  const [storage, setStorage] = useState("");

  // Home Remedies form fields
  const [homeRemedyName, setHomeRemedyName] = useState("");
  const [amharicName, setAmharicName] = useState("");
  const [homeRemediesText, setHomeRemediesText] = useState("");
  const [medicalAdvise, setMedicalAdvise] = useState("");

  // Minor Illnesses form fields
  const [minorIllnessName, setMinorIllnessName] = useState("");
  const [minorIllnessAmharicName, setMinorIllnessAmharicName] = useState("");
  const [presentation, setPresentation] = useState("");
  const [folkMedicine, setFolkMedicine] = useState("");
  const [otcDrug, setOtcDrug] = useState("");
  const [forPharmacists, setForPharmacists] = useState("");

  // Extemporaneous Preparation form fields
  const [preparationName, setPreparationName] = useState("");
  const [preparationUse, setPreparationUse] = useState("");
  const [formula, setFormula] = useState("");
  const [materials, setMaterials] = useState("");
  const [preparation, setPreparation] = useState("");
  const [label, setLabel] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchLinks();
    fetchMedications();
    fetchHomeRemedies();
    fetchMinorIllnesses();
    fetchExtemporaneousPreparations();
    fetchReports();
    fetchPatientCounts();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error.message);
      setMessage("Error fetching users: " + error.message);
    }
    setLoading(false);
  };

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase.from("medication_information").select("*").order("name");
      console.log("Fetched medications:", data);
      console.log("Medications fetched:", data, error);
      if (error) throw new Error(error.message);
      setMedicationInformation(data || []);
    } catch (err) {
      setError("Error fetching medications: " + err.message);
    }
  };

  const fetchHomeRemedies = async () => {
    try {
      const { data, error } = await supabase.from("home_remedies").select("*").order("name");
      if (error) throw new Error(error.message);
      setHomeRemedies(data || []);
    } catch (err) {
      setError("Error fetching home remedies: " + err.message);
    }
  };

  const fetchMinorIllnesses = async () => {
    try {
      const { data, error } = await supabase.from("minor_illnesses").select("*").order("name");
      if (error) throw new Error(error.message);
      setMinorIllnesses(data || []);
    } catch (err) {
      setError("Error fetching minor illnesses: " + err.message);
    }
  };

  const fetchExtemporaneousPreparations = async () => {
    try {
      const { data, error } = await supabase.from("extemporaneous_preparations").select("*").order("name");
      if (error) throw new Error(error.message);
      setExtemporaneousPreparations(data || []);
    } catch (err) {
      setError("Error fetching extemporaneous preparations: " + err.message);
    }
  };
  
  const fetchPatientCounts = async () => {
    try {
      const { data: patientsData, error: patientsError } = await supabase
        .from("patients")
        .select("created_by");
      
      if (patientsError) throw patientsError;

      const counts = {};
      patientsData.forEach(patient => {
        const userId = patient.created_by;
        if (userId) {
          counts[userId] = (counts[userId] || 0) + 1;
        }
      });

      setPatientCounts(counts);
    } catch (error) {
      console.error("Error fetching patient counts:", error.message);
    }
  };

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase.from("resource_links").select("*");
      if (error) throw error;
      setResourceLinks(data);
    } catch (error) {
      console.error("Error fetching links:", error.message);
      setMessage("Error fetching links: " + error.message);
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("appointments_history");

      if (error) throw error;

      const parsedReports = data.flatMap(item => {
        try {
          const appointments = JSON.parse(item.appointments_history);
          return appointments.map(appointment => ({
            id: appointment.id,
            added_by: appointment.added_by,
            diagnosis: appointment.diagnosis,
            appointment_date: appointment.appointment_date,
            patient_code: appointment.patient_code,
          }));
        } catch (e) {
          console.error("Error parsing appointments history:", e);
          return [];
        }
      });

      setReports(parsedReports);
    } catch (error) {
      console.error("Error fetching reports:", error.message);
      setMessage("Error fetching reports: " + error.message);
    }
  };

  const approveUser = async (userId) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ approved: true })
        .eq("id", userId);

      if (error) throw error;

      setUsers(users.map(user => user.id === userId ? { ...user, approved: true } : user));
      setMessage("User approved successfully!");
    } catch (error) {
      setMessage("Error approving user: " + error.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
      setMessage("User deleted successfully!");
    } catch (error) {
      setMessage("Error deleting user: " + error.message);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();

    if (!linkName || !linkUrl) {
      setMessage("Both fields are required.");
      return;
    }

    try {
      if (editingLinkId) {
        const { error } = await supabase
          .from("resource_links")
          .update({ name: linkName, url: linkUrl })
          .eq("id", editingLinkId);

        if (error) throw error;
        setMessage("Link updated successfully!");
      } else {
        const { error } = await supabase.from("resource_links").insert([
          { name: linkName, url: linkUrl }
        ]);

        if (error) throw error;
        setMessage("Link added successfully!");
      }

      setLinkName("");
      setLinkUrl("");
      setEditingLinkId(null);
      fetchLinks();
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  const handleEditLink = (link) => {
    setLinkName(link.name);
    setLinkUrl(link.url);
    setEditingLinkId(link.id);
  };

  const handleDeleteLink = async (linkId) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;
    
    try {
      const { error } = await supabase
        .from("resource_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;
      setMessage("Link deleted successfully!");
      fetchLinks();
    } catch (error) {
      setMessage("Error deleting link: " + error.message);
    }
  };

  const handleAddAgreement = async (e) => {
    e.preventDefault();

    if (!agreementText) {
      setMessage("Agreement text is required.");
      return;
    }

    try {
      const { error } = await supabase.from("user_agreement").insert([
        { agreement_text: agreementText }
      ]);

      if (error) throw error;
      setAgreementText("");
      setMessage("Agreement added successfully!");
    } catch (error) {
      setMessage("Error adding agreement: " + error.message);
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    setError("");

    if (!medicationName) {
      setError("Medication name is required.");
      return;
    }

    setLoading(true);
    try {
      const medicationData = {
        name: medicationName,
        amharic_name: amharicMedicationName,
        usage: usage,
        before_taking: beforeTaking,
        while_taking: whileTaking,
        side_effects: sideEffects,
        serious_side_effects: seriousSideEffects,
        how_to_take: howToTake,
        missed_dose: missedDose,
        storage: storage
      };

      if (editingMedicationId) {
        const { error } = await supabase
          .from('medication_information')
          .update(medicationData)
          .eq("id", editingMedicationId);

        if (error) throw error;
        setMessage("Medication updated successfully!");
      } else {
        const { error } = await supabase.from('medication_information').insert([medicationData]);
        if (error) throw error;
        setMessage("Medication added successfully!");
      }

      // Reset form
      setMedicationName("");
      setAmharicName("");
      setUsage("");
      setBeforeTaking("");
      setWhileTaking("");
      setSideEffects("");
      setSeriousSideEffects("");
      setHowToTake("");
      setMissedDose("");
      setStorage("");
      setEditingMedicationId(null);
      fetchMedications();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMedication = (medication) => {
    setMedicationName(medication.name);
    setAmharicMedicationName(medication.amharic_name || "");
    setUsage(medication.usage || "");
    setBeforeTaking(medication.before_taking || "");
    setWhileTaking(medication.while_taking || "");
    setSideEffects(medication.side_effects || "");
    setSeriousSideEffects(medication.serious_side_effects || "");
    setHowToTake(medication.how_to_take || "");
    setMissedDose(medication.missed_dose || "");
    setStorage(medication.storage || "");
    setEditingMedicationId(medication.id);
    setError("");
  };

  const handleDeleteMedication = async (medicationId) => {
    if (!window.confirm("Are you sure you want to delete this medication?")) return;
    
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase
        .from('medication_information')
        .delete()
        .eq("id", medicationId);

      if (error) throw error;
      setMessage("Medication deleted successfully!");
      fetchMedications();
    } catch (err) {
      setError("Error deleting medication: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHomeRemedy = async (e) => {
    e.preventDefault();
    setError("");

    if (!homeRemedyName) {
      setError("Home remedy name is required.");
      return;
    }

    setLoading(true);
    try {
      const homeRemedyData = {
        name: homeRemedyName,
        amharic_name: amharicName,
        home_remedies: homeRemediesText,
        medical_advise: medicalAdvise
      };

      if (editingHomeRemedyId) {
        const { error } = await supabase
          .from('home_remedies')
          .update(homeRemedyData)
          .eq("id", editingHomeRemedyId);

        if (error) throw error;
        setMessage("Home remedy updated successfully!");
      } else {
        const { error } = await supabase.from('home_remedies').insert([homeRemedyData]);
        if (error) throw error;
        setMessage("Home remedy added successfully!");
      }

      // Reset form
      setHomeRemedyName("");
      setAmharicName("");
      setHomeRemediesText("");
      setMedicalAdvise("");
      setEditingHomeRemedyId(null);
      fetchHomeRemedies();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditHomeRemedy = (homeRemedy) => {
    setHomeRemedyName(homeRemedy.name);
    setAmharicName(homeRemedy.amharic_name || "");
    setHomeRemediesText(homeRemedy.home_remedies || "");
    setMedicalAdvise(homeRemedy.medical_advise || "");
    setEditingHomeRemedyId(homeRemedy.id);
    setError("");
  };

  const handleDeleteHomeRemedy = async (homeRemedyId) => {
    if (!window.confirm("Are you sure you want to delete this home remedy?")) return;
    
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase
        .from('home_remedies')
        .delete()
        .eq("id", homeRemedyId);

      if (error) throw error;
      setMessage("Home remedy deleted successfully!");
      fetchHomeRemedies();
    } catch (err) {
      setError("Error deleting home remedy: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMinorIllness = async (e) => {
    e.preventDefault();
    setError("");

    if (!minorIllnessName) {
      setError("Minor illness name is required.");
      return;
    }

    setLoading(true);
    try {
      const minorIllnessData = {
        name: minorIllnessName,
        amharic_name: minorIllnessAmharicName,
        presentation: presentation,
        folk_medicine: folkMedicine,
        otc_drug: otcDrug,
        for_pharmacists: forPharmacists
      };

      if (editingMinorIllnessId) {
        const { error } = await supabase
          .from('minor_illnesses')
          .update(minorIllnessData)
          .eq("id", editingMinorIllnessId);

        if (error) throw error;
        setMessage("Minor illness updated successfully!");
      } else {
        const { error } = await supabase.from('minor_illnesses').insert([minorIllnessData]);
        if (error) throw error;
        setMessage("Minor illness added successfully!");
      }

      // Reset form
      setMinorIllnessName("");
      setMinorIllnessAmharicName("");
      setPresentation("");
      setFolkMedicine("");
      setOtcDrug("");
      setForPharmacists("");
      setEditingMinorIllnessId(null);
      fetchMinorIllnesses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMinorIllness = (minorIllness) => {
    setMinorIllnessName(minorIllness.name);
    setMinorIllnessAmharicName(minorIllness.amharic_name || "");
    setPresentation(minorIllness.presentation || "");
    setFolkMedicine(minorIllness.folk_medicine || "");
    setOtcDrug(minorIllness.otc_drug || "");
    setForPharmacists(minorIllness.for_pharmacists || "");
    setEditingMinorIllnessId(minorIllness.id);
    setError("");
  };

  const handleDeleteMinorIllness = async (minorIllnessId) => {
    if (!window.confirm("Are you sure you want to delete this minor illness?")) return;
    
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase
        .from('minor_illnesses')
        .delete()
        .eq("id", minorIllnessId);

      if (error) throw error;
      setMessage("Minor illness deleted successfully!");
      fetchMinorIllnesses();
    } catch (err) {
      setError("Error deleting minor illness: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExtemporaneousPreparation = async (e) => {
    e.preventDefault();
    setError("");

    if (!preparationName) {
      setError("Preparation name is required.");
      return;
    }

    setLoading(true);
    try {
      const preparationData = {
        name: preparationName,
        use: preparationUse,
        formula: formula,
        materials: materials,
        preparation: preparation,
        label: label
      };

      if (editingExtemporaneousPreparationId) {
        const { error } = await supabase
          .from('extemporaneous_preparations')
          .update(preparationData)
          .eq("id", editingExtemporaneousPreparationId);

        if (error) throw error;
        setMessage("Extemporaneous preparation updated successfully!");
      } else {
        const { error } = await supabase.from('extemporaneous_preparations').insert([preparationData]);
        if (error) throw error;
        setMessage("Extemporaneous preparation added successfully!");
      }

      // Reset form
      setPreparationName("");
      setPreparationUse("");
      setFormula("");
      setMaterials("");
      setPreparation("");
      setLabel("");
      setEditingExtemporaneousPreparationId(null);
      fetchExtemporaneousPreparations();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditExtemporaneousPreparation = (extemporaneousPreparation) => {
    setPreparationName(extemporaneousPreparation.name);
    setPreparationUse(extemporaneousPreparation.use || "");
    setFormula(extemporaneousPreparation.formula || "");
    setMaterials(extemporaneousPreparation.materials || "");
    setPreparation(extemporaneousPreparation.preparation || "");
    setLabel(extemporaneousPreparation.label || "");
    setEditingExtemporaneousPreparationId(extemporaneousPreparation.id);
    setError("");
  };

  const handleDeleteExtemporaneousPreparation = async (preparationId) => {
    if (!window.confirm("Are you sure you want to delete this extemporaneous preparation?")) return;
    
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase
        .from('extemporaneous_preparations')
        .delete()
        .eq("id", preparationId);

      if (error) throw error;
      setMessage("Extemporaneous preparation deleted successfully!");
      fetchExtemporaneousPreparations();
    } catch (err) {
      setError("Error deleting extemporaneous preparation: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-6xl">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">Admin Dashboard</h2>

        <div className="text-right mb-6">
          <button
            onClick={logout}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === "users" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("users")}
          >
            User Management
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === "links" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("links")}
          >
            Resource Links
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === "medications" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("medications")}
          >
            <FaPills className="inline mr-2" /> Medication Information
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === "homeRemedies" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("homeRemedies")}
          >
            <FaHome className="inline mr-2" /> Home Remedies
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === "minorIllnesses" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("minorIllnesses")}
          >
            <FaStethoscope className="inline mr-2" /> Minor Illnesses
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === "extemporaneous" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("extemporaneous")}
          >
            <FaFlask className="inline mr-2" /> Extemporaneous Preparation
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === "agreements" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("agreements")}
          >
            User Agreements
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === "analytics" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-center ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message}
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-indigo-500">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">User Management</h3>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Full Name</th>
                    <th className="py-3 px-6 text-left">Phone</th>
                    <th className="py-3 px-6 text-left">Email</th>
                    <th className="py-3 px-6 text-left">Institution</th>
                    <th className="py-3 px-6 text-left">Country</th>
                    <th className="py-3 px-6 text-center">Patients Added</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100 transition duration-300">
                        <td className="py-3 px-6">{user.full_name}</td>
                        <td className="py-3 px-6">{user.phone}</td>
                        <td className="py-3 px-6">{user.email}</td>
                        <td className="py-3 px-6">{user.institution}</td>
                        <td className="py-3 px-6">{user.country}</td>
                        <td className="py-3 px-6 text-center">
                          {patientCounts[user.id] || 0}
                        </td>
                        <td className="py-3 px-6 text-center">
                          {user.approved ? (
                            <span className="text-green-500 font-semibold">Approved</span>
                          ) : (
                            <button
                              onClick={() => approveUser(user.id)}
                              className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-4 rounded transition-all duration-300 mr-2"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-4 rounded transition-all duration-300"
                            >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800">Total Users</h4>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-800">Total Patients</h4>
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(patientCounts).reduce((sum, count) => sum + count, 0)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-800">Average Patients/User</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {users.length > 0 
                    ? (Object.values(patientCounts).reduce((sum, count) => sum + count, 0) / users.length).toFixed(1)
                    : 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resource Links Tab */}
        {activeTab === "links" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-indigo-500">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Add/Edit Useful Link</h3>
                <form onSubmit={handleAddLink} className="space-y-4">
                  <div>
                    <label className="block text-gray-700" htmlFor="link-name">Link Name</label>
                    <input
                      id="link-name"
                      type="text"
                      value={linkName}
                      onChange={(e) => setLinkName(e.target.value)}
                      placeholder="Enter link name"
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700" htmlFor="link-url">Link URL</label>
                    <input
                      id="link-url"
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="Enter link URL"
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    {editingLinkId ? "Update Link" : "Add Link"}
                  </button>
                </form>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-indigo-500">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Useful Links</h3>
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Link Name</th>
                        <th className="py-3 px-6 text-left">Link URL</th>
                        <th className="py-3 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                      {resourceLinks.length > 0 ? (
                        resourceLinks.map((link) => (
                          <tr key={link.id} className="border-b border-gray-200 hover:bg-gray-100 transition duration-300">
                            <td className="py-3 px-6">{link.name}</td>
                            <td className="py-3 px-6">{link.url}</td>
                            <td className="py-3 px-6 text-center">
                              <button
                                onClick={() => handleEditLink(link)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-4 rounded transition-all duration-300 mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-4 rounded transition-all duration-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-4 text-gray-500">
                            No links found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Medication Information Tab */}
        {activeTab === "medications" && (
          <div className="grid grid-cols-1 gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Add/Edit Form */}
              <div className="bg-white p-6 rounded-2xl border-t-4 border-indigo-500">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  {editingMedicationId ? "Edit Medication" : "Add New Medication"}
                </h3>
                <form onSubmit={handleAddMedication} className="space-y-4">
                  {/* Medication Name */}
                  <div>
                    <label className="block text-gray-700 mb-2">Medication Name *</label>
                    <input
                      type="text"
                      value={medicationName}
                      onChange={(e) => setMedicationName(e.target.value)}
                      placeholder="Enter medication name"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      required
                    />
                  </div>

                  {/* Amharic Medication Name */}
                  <div>
                    <label className="block text-gray-700 mb-2">አማርኛ</label>
                    <input
                      type="text"
                      value={amharicMedicationName}
                      onChange={(e) => setAmharicMedicationName(e.target.value)}
                      placeholder="Enter amharic medication name"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  {/* Usage */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      ይህ መድሃኒት ለምን ጥቅም ላይ ይውላል?
                    </label>
                    <textarea
                      value={usage}
                      onChange={(e) => setUsage(e.target.value)}
                      placeholder="Enter usage information"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  {/* Before Taking */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      ይህንን መድሃኒት ከመውሰዴ በፊት ለዶክተሬ ምን መንገር አለብኝ?
                    </label>
                    <textarea
                      value={beforeTaking}
                      onChange={(e) => setBeforeTaking(e.target.value)}
                      placeholder="Enter info to tell doctor before taking"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  {/* While Taking */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      ይህን መድሃኒት በምወስድበት ጊዜ ማወቅ ወይም ማድረግ ያለብኝ ነገሮች?
                    </label>
                    <textarea
                      value={whileTaking}
                      onChange={(e) => setWhileTaking(e.target.value)}
                      placeholder="Enter info about while taking"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  {/* Side Effects */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      የዚህ መድሃኒት አንዳንድ የጎንዮሽ ጉዳቶች?
                    </label>
                    <textarea
                      value={sideEffects}
                      onChange={(e) => setSideEffects(e.target.value)}
                      placeholder="Enter side effects"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  {/* Serious Side Effects */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      ወዲያውኑ ለሐኪሜ ማሳወቅ ያለብኝ ጉዳቶች?
                    </label>
                    <textarea
                      value={seriousSideEffects}
                      onChange={(e) => setSeriousSideEffects(e.target.value)}
                      placeholder="Enter serious side effects"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  {/* How To Take */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      ይህ መድሃኒት እንዴት ይወሰዳል?
                    </label>
                    <textarea
                      value={howToTake}
                      onChange={(e) => setHowToTake(e.target.value)}
                      placeholder="Enter how to take"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  {/* Missed Dose */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      መድሃኒቱን ሳልወሰድ ሰዓቱ ካለፈ ምን ማድረግ አለብኝ?
                    </label>
                    <textarea
                      value={missedDose}
                      onChange={(e) => setMissedDose(e.target.value)}
                      placeholder="Enter missed dose instructions"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  {/* Storage */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      ይህንን መድሃኒት እንዴት ማስቀመጥ እችላለሁ?
                    </label>
                    <textarea
                      value={storage}
                      onChange={(e) => setStorage(e.target.value)}
                      placeholder="Enter storage instructions"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {loading
                      ? "Processing..."
                      : editingMedicationId
                      ? "Update Medication"
                      : "Add Medication"}
                  </button>
                </form>
              </div>

              {/* Medication List */}
              <div className="bg-white p-6 rounded-2xl border-t-4 border-indigo-500">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Medication List
                </h3>
                {medicationInformation.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaPills className="text-4xl mx-auto mb-4 text-gray-300" />
                    <p>No medications found. Add your first medication using the form.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-left">Medication Name</th>
                          <th className="py-3 px-6 text-left">Amharic Name</th>
                          <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm font-light">
                        {medicationInformation.map((medication) => (
                          <tr
                            key={medication.id}
                            className="border-b border-gray-200 hover:bg-gray-100 transition duration-300"
                          >
                            <td className="py-3 px-6 font-medium">{medication.name}</td>
                            <td className="py-3 px-6">
                              {medication.amharic_name || "-"}
                            </td>
                            <td className="py-3 px-6 text-center">
                              <button
                                onClick={() => handleEditMedication(medication)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded transition-all duration-300 mr-2"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteMedication(medication.id)}
                                disabled={loading}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-2 px-4 rounded transition-all duration-300"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Home Remedies Tab */}
        {activeTab === "homeRemedies" && (
          <div className="grid grid-cols-1 gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Add/Edit Form */}
              <div className="bg-white p-6 rounded-2xl border-t-4 border-indigo-500">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  {editingHomeRemedyId ? "Edit Home Remedy" : "Add New Home Remedy"}
                </h3>
                <form onSubmit={handleAddHomeRemedy} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Home Remedy Name *</label>
                    <input
                      type="text"
                      value={homeRemedyName}
                      onChange={(e) => setHomeRemedyName(e.target.value)}
                      placeholder="Enter home remedy name"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Amharic Name</label>
                    <input
                      type="text"
                      value={amharicName}
                      onChange={(e) => setAmharicName(e.target.value)}
                      placeholder="Enter Amharic name"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Home Remedies</label>
                    <textarea
                      value={homeRemediesText}
                      onChange={(e) => setHomeRemediesText(e.target.value)}
                      placeholder="Enter home remedies information"
                      rows="4"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Medical Advise</label>
                    <textarea
                      value={medicalAdvise}
                      onChange={(e) => setMedicalAdvise(e.target.value)}
                      placeholder="Enter medical advise"
                      rows="4"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {loading
                      ? "Processing..."
                      : editingHomeRemedyId
                      ? "Update Home Remedy"
                      : "Add Home Remedy"}
                  </button>
                </form>
              </div>

              {/* Home Remedies List */}
              <div className="bg-white p-6 rounded-2xl border-t-4 border-indigo-500">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Home Remedies List
                </h3>
                {homeRemedies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaHome className="text-4xl mx-auto mb-4 text-gray-300" />
                    <p>No home remedies found. Add your first home remedy using the form.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-left">Name</th>
                          <th className="py-3 px-6 text-left">Amharic Name</th>
                          <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm font-light">
                        {homeRemedies.map((remedy) => (
                          <tr
                            key={remedy.id}
                            className="border-b border-gray-200 hover:bg-gray-100 transition duration-300"
                          >
                            <td className="py-3 px-6 font-medium">{remedy.name}</td>
                            <td className="py-3 px-6">
                              {remedy.amharic_name || "-"}
                            </td>
                            <td className="py-3 px-6 text-center">
                              <button
                                onClick={() => handleEditHomeRemedy(remedy)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded transition-all duration-300 mr-2"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteHomeRemedy(remedy.id)}
                                disabled={loading}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-2 px-4 rounded transition-all duration-300"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Minor Illnesses Tab */}
        {activeTab === "minorIllnesses" && (
          <div className="grid grid-cols-1 gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Add/Edit Form */}
              <div className="bg-white p-6 rounded-2xl border-t-4 border-indigo-500">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  {editingMinorIllnessId ? "Edit Minor Illness" : "Add New Minor Illness"}
                </h3>
                <form onSubmit={handleAddMinorIllness} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Minor Illness Name *</label>
                    <input
                      type="text"
                      value={minorIllnessName}
                      onChange={(e) => setMinorIllnessName(e.target.value)}
                      placeholder="Enter minor illness name"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Amharic Name</label>
                    <input
                      type="text"
                      value={minorIllnessAmharicName}
                      onChange={(e) => setMinorIllnessAmharicName(e.target.value)}
                      placeholder="Enter Amharic name"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Presentation</label>
                    <textarea
                      value={presentation}
                      onChange={(e) => setPresentation(e.target.value)}
                      placeholder="Enter presentation information"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Folk Medicine</label>
                    <textarea
                      value={folkMedicine}
                      onChange={(e) => setFolkMedicine(e.target.value)}
                      placeholder="Enter folk medicine information"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">OTC Drug</label>
                    <textarea
                      value={otcDrug}
                      onChange={(e) => setOtcDrug(e.target.value)}
                      placeholder="Enter OTC drug information"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Guide For Pharmacists</label>
                    <textarea
                      value={forPharmacists}
                      onChange={(e) => setForPharmacists(e.target.value)}
                      placeholder="Enter guide for pharmacists"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {loading
                      ? "Processing..."
                      : editingMinorIllnessId
                      ? "Update Minor Illness"
                      : "Add Minor Illness"}
                  </button>
                </form>
              </div>

              {/* Minor Illnesses List */}
              <div className="bg-white p-6 rounded-2xl border-t-4 border-indigo-500">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Minor Illnesses List
                </h3>
                {minorIllnesses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaStethoscope className="text-4xl mx-auto mb-4 text-gray-300" />
                    <p>No minor illnesses found. Add your first minor illness using the form.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-left">Name</th>
                          <th className="py-3 px-6 text-left">Amharic Name</th>
                          <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm font-light">
                        {minorIllnesses.map((illness) => (
                          <tr
                            key={illness.id}
                            className="border-b border-gray-200 hover:bg-gray-100 transition duration-300"
                          >
                            <td className="py-3 px-6 font-medium">{illness.name}</td>
                            <td className="py-3 px-6">
                              {illness.amharic_name || "-"}
                            </td>
                            <td className="py-3 px-6 text-center">
                              <button
                                onClick={() => handleEditMinorIllness(illness)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded transition-all duration-300 mr-2"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteMinorIllness(illness.id)}
                                disabled={loading}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-2 px-4 rounded transition-all duration-300"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Extemporaneous Preparation Tab */}
        {activeTab === "extemporaneous" && (
          <div className="grid grid-cols-1 gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Add/Edit Form */}
              <div className="bg-white p-6 rounded-2xl border-t-4 border-indigo-500">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  {editingExtemporaneousPreparationId ? "Edit Extemporaneous Preparation" : "Add New Extemporaneous Preparation"}
                </h3>
                <form onSubmit={handleAddExtemporaneousPreparation} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Preparation Name *</label>
                    <input
                      type="text"
                      value={preparationName}
                      onChange={(e) => setPreparationName(e.target.value)}
                      placeholder="Enter preparation name"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Use</label>
                    <textarea
                      value={preparationUse}
                      onChange={(e) => setPreparationUse(e.target.value)}
                      placeholder="Enter use information"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Formula</label>
                    <textarea
                      value={formula}
                      onChange={(e) => setFormula(e.target.value)}
                      placeholder="Enter formula"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Materials</label>
                    <textarea
                      value={materials}
                      onChange={(e) => setMaterials(e.target.value)}
                      placeholder="Enter materials needed"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Preparation</label>
                    <textarea
                      value={preparation}
                      onChange={(e) => setPreparation(e.target.value)}
                      placeholder="Enter preparation steps"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Label</label>
                    <textarea
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="Enter label information"
                      rows="3"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {loading
                      ? "Processing..."
                      : editingExtemporaneousPreparationId
                      ? "Update Preparation"
                      : "Add Preparation"}
                  </button>
                </form>
              </div>

              {/* Extemporaneous Preparations List */}
              <div className="bg-white p-6 rounded-2xl border-t-4 border-indigo-500">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Extemporaneous Preparations List
                </h3>
                {extemporaneousPreparations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaFlask className="text-4xl mx-auto mb-4 text-gray-300" />
                    <p>No extemporaneous preparations found. Add your first preparation using the form.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-left">Name</th>
                          <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm font-light">
                        {extemporaneousPreparations.map((preparation) => (
                          <tr
                            key={preparation.id}
                            className="border-b border-gray-200 hover:bg-gray-100 transition duration-300"
                          >
                            <td className="py-3 px-6 font-medium">{preparation.name}</td>
                            <td className="py-3 px-6 text-center">
                              <button
                                onClick={() => handleEditExtemporaneousPreparation(preparation)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded transition-all duration-300 mr-2"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteExtemporaneousPreparation(preparation.id)}
                                disabled={loading}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-2 px-4 rounded transition-all duration-300"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Agreements Tab */}
        {activeTab === "agreements" && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-indigo-500">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Add User Agreement</h3>
            <form onSubmit={handleAddAgreement} className="space-y-4">
              <div>
                <textarea
                  id="agreement-text"
                  value={agreementText}
                  onChange={(e) => setAgreementText(e.target.value)}
                  placeholder="Enter agreement text"
                  rows="5"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Add Agreement
              </button>
            </form>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <NumberOfPatientsDashboard />
            <AppointmentsTable />
            <PharmacistDashboardCharts />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
