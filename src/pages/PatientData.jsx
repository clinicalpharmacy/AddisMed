import { useState } from "react";

const PatientData = () => {
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [pregnancy, setPregnancy] = useState(null);

  const [pulse, setPulse] = useState("");
  const [labs, setLabs] = useState([
    { name: "SCr", value: "", unit: "mg/dL", use: true },
    { name: "Serum Albumin", value: "", unit: "g/dL", use: true },
    { name: "Serum Potassium", value: "", unit: "mEq/L", use: true },
  ]);

  const [imaging, setImaging] = useState([
    { type: "CT", finding: "Intracranial Hemorrhage", present: false, use: true },
  ]);

  const pregnancyAllowed =
    gender === "Female" &&
    ageGroup !== "Neonate" &&
    ageGroup !== "Infant" &&
    Number(ageYears) >= 14;

  const addLab = () =>
    setLabs([...labs, { name: "", value: "", unit: "", use: true }]);

  const addImaging = () =>
    setImaging([
      ...imaging,
      { type: "", finding: "", present: false, use: true },
    ]);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Patient Data</h2>

      {/* AGE & GENDER */}
      <section>
        <label>Gender</label>
        <select onChange={(e) => setGender(e.target.value)}>
          <option value="">Select</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <label>Age Group</label>
        <select onChange={(e) => setAgeGroup(e.target.value)}>
          <option value="">Select</option>
          <option>Neonate</option>
          <option>Infant</option>
          <option>Child</option>
          <option>Adult</option>
        </select>

        {(ageGroup === "Child" || ageGroup === "Adult") && (
          <input
            type="number"
            placeholder="Age in years"
            value={ageYears}
            onChange={(e) => setAgeYears(e.target.value)}
          />
        )}
      </section>

      {/* PREGNANCY */}
      {pregnancyAllowed && (
        <section>
          <label>Pregnancy</label>
          <select onChange={(e) => setPregnancy(e.target.value === "Yes")}>
            <option value="">Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </section>
      )}

      {/* VITAL SIGNS */}
      <section>
        <h3>Vital Signs</h3>
        <label>
          <input type="checkbox" defaultChecked /> Use for CDSS
        </label>
        <input
          type="number"
          placeholder="Pulse rate (beats/min)"
          value={pulse}
          onChange={(e) => setPulse(e.target.value)}
        />
      </section>

      {/* LABORATORY TESTS */}
      <section>
        <h3>Laboratory Tests</h3>
        {labs.map((lab, i) => (
          <div key={i}>
            <input
              placeholder="Test name"
              value={lab.name}
              onChange={(e) =>
                setLabs(
                  labs.map((l, idx) =>
                    idx === i ? { ...l, name: e.target.value } : l
                  )
                )
              }
            />
            <input
              type="number"
              placeholder="Value"
              value={lab.value}
              onChange={(e) =>
                setLabs(
                  labs.map((l, idx) =>
                    idx === i ? { ...l, value: e.target.value } : l
                  )
                )
              }
            />
            <input
              placeholder="Unit"
              value={lab.unit}
              onChange={(e) =>
                setLabs(
                  labs.map((l, idx) =>
                    idx === i ? { ...l, unit: e.target.value } : l
                  )
                )
              }
            />
            <label>
              <input
                type="checkbox"
                checked={lab.use}
                onChange={(e) =>
                  setLabs(
                    labs.map((l, idx) =>
                      idx === i ? { ...l, use: e.target.checked } : l
                    )
                  )
                }
              />
              Use for CDSS
            </label>
          </div>
        ))}
        <button onClick={addLab}>+ Add Lab Test</button>
      </section>

      {/* IMAGING */}
      <section>
        <h3>Imaging Results</h3>
        {imaging.map((img, i) => (
          <div key={i}>
            <input
              placeholder="Imaging type"
              value={img.type}
              onChange={(e) =>
                setImaging(
                  imaging.map((im, idx) =>
                    idx === i ? { ...im, type: e.target.value } : im
                  )
                )
              }
            />
            <input
              placeholder="Finding"
              value={img.finding}
              onChange={(e) =>
                setImaging(
                  imaging.map((im, idx) =>
                    idx === i ? { ...im, finding: e.target.value } : im
                  )
                )
              }
            />
            <label>
              Present
              <input
                type="checkbox"
                checked={img.present}
                onChange={(e) =>
                  setImaging(
                    imaging.map((im, idx) =>
                      idx === i ? { ...im, present: e.target.checked } : im
                    )
                  )
                }
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={img.use}
                onChange={(e) =>
                  setImaging(
                    imaging.map((im, idx) =>
                      idx === i ? { ...im, use: e.target.checked } : im
                    )
                  )
                }
              />
              Use for CDSS
            </label>
          </div>
        ))}
        <button onClick={addImaging}>+ Add Imaging</button>
      </section>
    </div>
  );
};

export default PatientData;
