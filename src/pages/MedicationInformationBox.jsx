import { useState, useEffect } from "react";
import { FaPills, FaPlus, FaTrash, FaUserMd, FaClock } from "react-icons/fa";
import supabase from "../utils/supabase";

const MedicationInformationBox = () => {
  const [medications, setMedications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    id: "",
    name: "",
    generic_name: "",
    usage: "",
    before_taking: "",
    while_taking: "",
    side_effects: "",
    serious_side_effects: "",
    how_to_take: "",
    missed_dose: "",
    storage: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteAuth, setShowDeleteAuth] = useState(false);
  const [deletePasscode, setDeletePasscode] = useState("");
  const [medicationToDelete, setMedicationToDelete] = useState(null);

  // Load + subscribe realtime
  useEffect(() => {
    fetchMedications();
    const cleanup = setupRealtime();
    return cleanup;
  }, []);

  const setupRealtime = () => {
    const channel = supabase
      .channel("medication-info-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "medication_information" },
        () => fetchMedications()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  };

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("medication_information")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMedications(data || []);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error loading medication information: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async () => {
    if (!newMedication.id.trim() || !newMedication.name.trim()) {
      setErrorMessage("Please enter both ID and Name.");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase
        .from("medication_information")
        .insert([newMedication]);
      if (error) throw error;

      setErrorMessage("");
      setShowAddForm(false);
      setNewMedication({
        id: "",
        name: "",
        generic_name: "",
        usage: "",
        before_taking: "",
        while_taking: "",
        side_effects: "",
        serious_side_effects: "",
        how_to_take: "",
        missed_dose: "",
        storage: ""
      });
    } catch (err) {
      setErrorMessage("Error adding medication: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuth = (id) => {
    setMedicationToDelete(id);
    setShowDeleteAuth(true);
    setDeletePasscode("");
  };

  const verifyAndDelete = async () => {
    if (deletePasscode !== "%") {
      setErrorMessage("Invalid delete passcode");
      setShowDeleteAuth(false);
      return;
    }
    try {
      const { error } = await supabase
        .from("medication_information")
        .delete()
        .eq("id", medicationToDelete);
      if (error) throw error;
      setShowDeleteAuth(false);
      setMedicationToDelete(null);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage("Error deleting medication: " + err.message);
    }
  };

  const getTimeSince = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHrs = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffHrs < 1) return `${Math.floor((now - date) / (1000 * 60))}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex justify-center items-center gap-2">
            <FaPills className="text-green-500" /> Medication Information
          </h1>
          <p className="text-gray-500 mt-2">
            View and manage stored medication details.
          </p>
        </div>

        {/* Toggle Add Form */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow"
          >
            <FaPlus /> Add Medication
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-gray-50 border rounded-xl p-4 mb-6">
            <div className="grid md:grid-cols-2 gap-3">
              {Object.keys(newMedication).map((field) => (
                <div key={field}>
                  <input
                    type="text"
                    placeholder={field.replace("_", " ")}
                    value={newMedication[field]}
                    onChange={(e) =>
                      setNewMedication({
                        ...newMedication,
                        [field]: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={handleAddMedication}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div className="text-red-600 text-center mb-4">{errorMessage}</div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-4">
            {medications.map((m) => (
              <div
                key={m.id}
                className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FaPills className="text-green-500" /> {m.name}
                    </h2>
                    <p className="text-sm text-gray-500 italic mb-2">
                      Generic: {m.generic_name || "N/A"}
                    </p>
                    <div className="text-gray-700 space-y-1 text-sm">
                      {m.usage && <p><strong>Usage:</strong> {m.usage}</p>}
                      {m.before_taking && <p><strong>Before taking:</strong> {m.before_taking}</p>}
                      {m.while_taking && <p><strong>While taking:</strong> {m.while_taking}</p>}
                      {m.side_effects && <p><strong>Side effects:</strong> {m.side_effects}</p>}
                      {m.serious_side_effects && <p><strong>Serious side effects:</strong> {m.serious_side_effects}</p>}
                      {m.how_to_take && <p><strong>How to take:</strong> {m.how_to_take}</p>}
                      {m.missed_dose && <p><strong>Missed dose:</strong> {m.missed_dose}</p>}
                      {m.storage && <p><strong>Storage:</strong> {m.storage}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAuth(m.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                  <FaUserMd /> Pharmacist
                  <FaClock /> {getTimeSince(m.created_at)}
                </div>
              </div>
            ))}
            {medications.length === 0 && (
              <div className="text-center text-gray-400">
                No medication information found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Auth Modal */}
      {showDeleteAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">
              Enter delete passcode
            </h3>
            <input
              type="password"
              value={deletePasscode}
              onChange={(e) => setDeletePasscode(e.target.value)}
              placeholder="Enter passcode"
              className="border w-full rounded p-2 mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteAuth(false)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={verifyAndDelete}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationInformationBox;
