import React, { useState, useEffect, useCallback } from "react";
import supabase from "../utils/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faSync,
  faCheckCircle,
  faExclamationTriangle,
  faChevronDown,
  faChevronUp
} from "@fortawesome/free-solid-svg-icons";

const CRASection = ({ patientData, medicationHistory, patientCode, onRuleDetected }) => {
  const [clinicalRules, setClinicalRules] = useState([]);
  const [results, setResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState({});

  // ----------------------------------
  // Load active clinical rules
  // ----------------------------------
  const loadClinicalRules = useCallback(async () => {
    const { data, error } = await supabase
      .from("clinical_rules")
      .select("*")
      .eq("is_active", true)
      .order("rule_type", { ascending: true });

    if (error) {
      console.error("Failed to load clinical rules:", error.message);
      return;
    }

    const parsed = data.map(rule => {
      let condition = rule.rule_condition;
      if (typeof condition === "string") {
        try {
          condition = JSON.parse(condition);
        } catch {
          condition = null;
        }
      }
      return { ...rule, rule_condition: condition };
    });

    setClinicalRules(parsed);
  }, []);

  useEffect(() => {
    loadClinicalRules();
  }, [loadClinicalRules]);

  // ----------------------------------
  // Helpers
  // ----------------------------------
  const getLabValue = (name) => {
    const lab = patientData?.labs?.find(
      l => l.use && l.name.toLowerCase() === name.toLowerCase()
    );
    return lab ? parseFloat(lab.value) : null;
  };

  const durationToDays = (duration) => {
    if (!duration) return 0;
    const match = duration.match(/(\d+)\s*days?/i);
    return match ? parseInt(match[1]) : 0;
  };

  // ----------------------------------
  // Evaluate a single rule
  // ----------------------------------
  const evaluateRule = (rule, patient, meds) => {
    if (!rule.rule_condition) return null;

    const cond = rule.rule_condition;
    const evidence = [];
    const affectedMeds = [];

    // ---- Patient criteria ----
    if (cond.patient) {
      const age = parseInt(patient.ageYears) || 0;

      if (cond.patient.gender && cond.patient.gender !== patient.gender) return null;
      if (cond.patient.minAge && age < cond.patient.minAge) return null;
      if (cond.patient.maxAge && age > cond.patient.maxAge) return null;
      if (cond.patient.pregnancy !== undefined && cond.patient.pregnancy !== patient.pregnancy) {
        return null;
      }
    }

    // ---- Drug criteria ----
    if (cond.drugs?.length) {
      meds.forEach(med => {
        const matched = cond.drugs.some(d =>
          med.drug_name?.toLowerCase().includes(d.toLowerCase()) ||
          med.drug_class?.toLowerCase().includes(d.toLowerCase())
        );
        if (matched) affectedMeds.push(med);
      });

      if (affectedMeds.length === 0) return null;

      if (cond.duration) {
        affectedMeds.forEach(med => {
          const days = durationToDays(med.duration);
          if (cond.duration.min && days < cond.duration.min) {
            evidence.push(`${med.drug_name}: duration below recommended`);
          }
          if (cond.duration.max && days > cond.duration.max) {
            evidence.push(`${med.drug_name}: duration exceeds recommended`);
          }
        });
      }
    }

    // ---- Laboratory criteria ----
    if (cond.labs?.length) {
      cond.labs.forEach(lab => {
        const value = getLabValue(lab.name);
        if (value === null) return;

        const violated =
          (lab.op === ">" && value > lab.value) ||
          (lab.op === "<" && value < lab.value) ||
          (lab.op === ">=" && value >= lab.value) ||
          (lab.op === "<=" && value <= lab.value);

        if (violated) {
          evidence.push(`${lab.name} = ${value} ${lab.op} ${lab.value}`);
        }
      });
    }

    // ---- Drug–Drug interaction ----
    if (cond.interaction?.length && meds.length > 1) {
      cond.interaction.forEach(pair => {
        const hasA = meds.some(m => m.drug_class === pair[0]);
        const hasB = meds.some(m => m.drug_class === pair[1]);
        if (hasA && hasB) {
          evidence.push(`Interaction between ${pair[0]} and ${pair[1]}`);
        }
      });
    }

    if (evidence.length === 0 && affectedMeds.length === 0) return null;

    return {
      rule_id: rule.id,
      rule_name: rule.rule_name,
      rule_type: rule.rule_type, // DRN category used as rule type
      description: rule.rule_description,
      recommendation: rule.rule_action || "Review therapy",
      evidence,
      affectedMeds: affectedMeds.map(m => m.drug_name),
      timestamp: new Date().toISOString()
    };
  };

  // ----------------------------------
  // Run assessment
  // ----------------------------------
  const runAnalysis = async () => {
    if (!patientData || !medicationHistory || clinicalRules.length === 0) {
      alert("Patient data, medication history, or rules missing.");
      return;
    }

    setIsAnalyzing(true);
    setResults([]);

    const detected = [];

    clinicalRules.forEach(rule => {
      const res = evaluateRule(rule, patientData, medicationHistory);
      if (res) detected.push(res);
    });

    setResults(detected);
    setIsAnalyzing(false);

    if (onRuleDetected) onRuleDetected(detected);

    if (patientCode && detected.length > 0) {
      await supabase.from("cra_results").insert({
        patient_code: patientCode,
        results: detected,
        analysis_date: new Date().toISOString(),
        rules_triggered: detected.length
      });
    }
  };

  // ----------------------------------
  // UI
  // ----------------------------------
  return (
    <div className="bg-white border rounded-xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2 text-blue-800">
          <FontAwesomeIcon icon={faRobot} />
          Clinical Decision Support
        </h2>
        <div className="flex gap-3">
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={isAnalyzing ? faSync : faRobot} spin={isAnalyzing} />{" "}
            {isAnalyzing ? "Analyzing..." : "Run CDSS"}
          </button>
          <button
            onClick={loadClinicalRules}
            className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600"
          >
            <FontAwesomeIcon icon={faSync} /> Refresh Rules
          </button>
        </div>
      </div>

      {results.length === 0 && !isAnalyzing ? (
        <div className="text-center p-10 border-dashed border-2 rounded-xl">
          <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-500 mb-3" />
          <p className="text-gray-700">
            No potential drug-related problems detected.
          </p>
        </div>
      ) : (
        results.map((r, idx) => (
          <div key={idx} className="border rounded-lg p-4 bg-yellow-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600" />
                  {r.rule_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Rule type: <strong>{r.rule_type}</strong>
                </p>
                <p className="mt-2 text-gray-700">
                  There is a potential drug-related problem.
                </p>
              </div>
              <button
                onClick={() =>
                  setShowDetails(p => ({ ...p, [idx]: !p[idx] }))
                }
                className="text-blue-600"
              >
                <FontAwesomeIcon icon={showDetails[idx] ? faChevronUp : faChevronDown} />
              </button>
            </div>

            {showDetails[idx] && (
              <div className="mt-4 space-y-3">
                {r.evidence.length > 0 && (
                  <div>
                    <h4 className="font-semibold">Evidence</h4>
                    <ul className="list-disc pl-5">
                      {r.evidence.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {r.affectedMeds.length > 0 && (
                  <div>
                    <h4 className="font-semibold">Affected medications</h4>
                    <div className="flex flex-wrap gap-2">
                      {r.affectedMeds.map((m, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold">Recommendation</h4>
                  <p className="bg-white p-3 rounded">{r.recommendation}</p>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default CRASection;
