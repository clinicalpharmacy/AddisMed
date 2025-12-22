import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import { FaEdit, FaTrash, FaPlus, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const Costsection = ({ patientCode }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal and form state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [modalType, setModalType] = useState('incurred'); // 'incurred' | 'reduced'
  const [formNote, setFormNote] = useState('');
  const [formTotal, setFormTotal] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  // Collapsible sections
  const [showIncurred, setShowIncurred] = useState(false);
  const [showReduced, setShowReduced] = useState(false);

  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientCode]);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('cost_section')
      .eq('patient_code', patientCode)
      .single();

    if (error) {
      console.error('Error fetching cost data:', error.message);
      setEntries([]);
      setLoading(false);
      return;
    }

    const raw = data?.cost_section || [];
    const normalized = [];

    raw.forEach((entry) => {
      if (!entry) return;
      if (entry.type && (entry.total !== undefined || entry.note !== undefined)) {
        normalized.push({
          type: entry.type,
          total: entry.total !== undefined ? entry.total : '',
          note: entry.note || '',
          timestamp: entry.timestamp || new Date().toISOString(),
        });
      } else {
        if (entry.costIncurredTotal !== undefined || entry.costIncurredNote) {
          normalized.push({
            type: 'incurred',
            total: entry.costIncurredTotal !== undefined ? entry.costIncurredTotal : '',
            note: entry.costIncurredNote || '',
            timestamp: entry.timestamp || new Date().toISOString(),
          });
        }
        if (entry.costReducedTotal !== undefined || entry.costReducedNote) {
          normalized.push({
            type: 'reduced',
            total: entry.costReducedTotal !== undefined ? entry.costReducedTotal : '',
            note: entry.costReducedNote || '',
            timestamp: entry.timestamp || new Date().toISOString(),
          });
        }
      }
    });

    normalized.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setEntries(normalized);
    setLoading(false);
  };

  const persist = async (updated) => {
    const { error } = await supabase
      .from('patients')
      .update({ cost_section: updated })
      .eq('patient_code', patientCode);
    if (error) {
      console.error('Error saving cost entry:', error.message);
      return false;
    }
    return true;
  };

  const openAddModal = (type = 'incurred') => {
    setModalMode('add');
    setModalType(type);
    setFormNote('');
    setFormTotal('');
    setEditingIndex(null);
    setModalOpen(true);
  };

  const openEditModal = (index) => {
    const e = entries[index];
    if (!e) return;
    setModalMode('edit');
    setModalType(e.type);
    setFormNote(e.note || '');
    setFormTotal(String(e.total ?? ''));
    setEditingIndex(index);
    setModalOpen(true);
  };

  const saveFromModal = async () => {
    if (formTotal === '' || isNaN(Number(formTotal))) {
      alert('Please enter a numeric total amount.');
      return;
    }

    const timestamp = new Date().toISOString();
    let updated = [...entries];

    if (modalMode === 'edit' && editingIndex !== null) {
      updated[editingIndex] = {
        ...updated[editingIndex],
        type: modalType,
        note: formNote,
        total: Number(formTotal),
        timestamp,
      };
    } else {
      updated = [
        { type: modalType, note: formNote, total: Number(formTotal), timestamp },
        ...updated,
      ];
    }

    const ok = await persist(updated);
    if (ok) {
      setEntries(updated);
      setModalOpen(false);
      setEditingIndex(null);
    }
  };

  const deleteEntry = async (index) => {
    const e = entries[index];
    if (!e) return;
    const okDelete = window.confirm(
      `Delete this ${e.type} entry?\n\n${e.note ? e.note + '\n\n' : ''}Amount: ${e.total} ETB`
    );
    if (!okDelete) return;
    const updated = entries.filter((_, i) => i !== index);
    const ok = await persist(updated);
    if (ok) setEntries(updated);
  };

  const sumByType = (type) =>
    entries
      .filter((e) => e.type === type)
      .reduce((acc, cur) => acc + (Number(cur.total) || 0), 0);

  const toggleExpand = (index) =>
    setExpandedIndex((prev) => (prev === index ? null : index));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Cost Section</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Total Cost Incurred</div>
              <div className="text-2xl font-semibold text-blue-700">
                {sumByType('incurred')} ETB
              </div>
            </div>
            <button
              onClick={() => openAddModal('incurred')}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FaPlus className="mr-2" /> Add
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-white shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Total Cost Reduced</div>
              <div className="text-2xl font-semibold text-indigo-700">
                {sumByType('reduced')} ETB
              </div>
            </div>
            <button
              onClick={() => openAddModal('reduced')}
              className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              <FaPlus className="mr-2" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Incurred Section (collapsible) */}
      <section className="mb-8">
        <button
          onClick={() => setShowIncurred((prev) => !prev)}
          className="w-full flex justify-between items-center bg-blue-100 hover:bg-blue-200 text-blue-900 font-semibold text-lg px-4 py-3 rounded-lg transition"
        >
          <span>Incurred costs by pharmacist interventions</span>
          {showIncurred ? <FaChevronDown /> : <FaChevronRight />}
        </button>

        {showIncurred && (
          <div className="mt-4 space-y-3 transition-all">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : entries.filter((e) => e.type === 'incurred').length === 0 ? (
              <p className="text-sm text-gray-500">No incurred entries yet.</p>
            ) : (
              entries
                .filter((e) => e.type === 'incurred')
                .map((e, idx) => {
                  const originalIndex = entries.findIndex(
                    (ent) =>
                      ent.timestamp === e.timestamp &&
                      ent.type === e.type &&
                      String(ent.total) === String(e.total) &&
                      ent.note === e.note
                  );
                  const isExpanded = expandedIndex === originalIndex;
                  return (
                    <div
                      key={e.timestamp + idx}
                      className="bg-blue-50 hover:bg-blue-100 rounded-2xl p-4 shadow-sm cursor-pointer"
                      onClick={() => toggleExpand(originalIndex)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-lg font-semibold text-blue-800">
                            {e.total} ETB
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(e.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            title="Edit"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              openEditModal(originalIndex);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <FaEdit />
                          </button>
                          <button
                            title="Delete"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              deleteEntry(originalIndex);
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap transition-all duration-300">
                          <div className="font-medium text-gray-600 mb-1">Note</div>
                          {e.note ? (
                            <div className="bg-white rounded-xl p-3 shadow-inner">
                              {e.note}
                            </div>
                          ) : (
                            <div className="text-gray-400 italic">— no note —</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        )}
      </section>

      {/* Reduced Section (collapsible) */}
      <section>
        <button
          onClick={() => setShowReduced((prev) => !prev)}
          className="w-full flex justify-between items-center bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-semibold text-lg px-4 py-3 rounded-lg transition"
        >
          <span>Reduced costs by pharmacist interventions</span>
          {showReduced ? <FaChevronDown /> : <FaChevronRight />}
        </button>

        {showReduced && (
          <div className="mt-4 space-y-3 transition-all">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : entries.filter((e) => e.type === 'reduced').length === 0 ? (
              <p className="text-sm text-gray-500">No reduced entries yet.</p>
            ) : (
              entries
                .filter((e) => e.type === 'reduced')
                .map((e, idx) => {
                  const originalIndex = entries.findIndex(
                    (ent) =>
                      ent.timestamp === e.timestamp &&
                      ent.type === e.type &&
                      String(ent.total) === String(e.total) &&
                      ent.note === e.note
                  );
                  const isExpanded = expandedIndex === originalIndex;
                  return (
                    <div
                      key={e.timestamp + idx}
                      className="bg-indigo-50 hover:bg-indigo-100 rounded-2xl p-4 shadow-sm cursor-pointer"
                      onClick={() => toggleExpand(originalIndex)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-lg font-semibold text-indigo-800">
                            {e.total} ETB
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(e.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            title="Edit"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              openEditModal(originalIndex);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <FaEdit />
                          </button>
                          <button
                            title="Delete"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              deleteEntry(originalIndex);
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap transition-all duration-300">
                          <div className="font-medium text-gray-600 mb-1">Note</div>
                          {e.note ? (
                            <div className="bg-white rounded-xl p-3 shadow-inner">
                              {e.note}
                            </div>
                          ) : (
                            <div className="text-gray-400 italic">— no note —</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        )}
      </section>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white w-full max-w-lg rounded shadow-lg p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">
                {modalMode === 'edit' ? 'Edit' : 'Add'} Cost Entry
              </h4>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingIndex(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2">
                <label
                  className={`px-3 py-2 rounded cursor-pointer ${
                    modalType === 'incurred'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value="incurred"
                    checked={modalType === 'incurred'}
                    onChange={() => setModalType('incurred')}
                    className="hidden"
                  />
                  Cost Incurred
                </label>

                <label
                  className={`px-3 py-2 rounded cursor-pointer ${
                    modalType === 'reduced'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value="reduced"
                    checked={modalType === 'reduced'}
                    onChange={() => setModalType('reduced')}
                    className="hidden"
                  />
                  Cost Reduced
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total ({modalType === 'incurred' ? 'Incurred' : 'Reduced'}) (ETB)
                </label>
                <input
                  type="number"
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-indigo-300"
                  value={formTotal}
                  onChange={(e) => setFormTotal(e.target.value)}
                  placeholder="e.g. 250.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Note (optional)
                </label>
                <textarea
                  rows="4"
                  className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-indigo-300"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Describe the cost or any details..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingIndex(null);
                }}
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={saveFromModal}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                {modalMode === 'edit' ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Costsection;
