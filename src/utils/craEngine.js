export const evaluateClinicalRules = (patientData, medicationHistory, rules) => {
  const detectedProblems = [];

  if (!patientData || !medicationHistory || !rules?.length) {
    return detectedProblems;
  }

  for (const rule of rules) {
    const condition = rule.rule_condition;
    if (!condition) continue;

    const evidence = [];
    const affectedMeds = [];

    // ------------------------
    // Patient-level criteria
    // ------------------------
    if (condition.patient) {
      const age = parseInt(patientData.ageYears) || 0;

      if (
        condition.patient.gender &&
        condition.patient.gender !== patientData.gender
      ) continue;

      if (
        condition.patient.minAge &&
        age < condition.patient.minAge
      ) continue;

      if (
        condition.patient.maxAge &&
        age > condition.patient.maxAge
      ) continue;

      if (
        condition.patient.pregnancy !== undefined &&
        condition.patient.pregnancy !== patientData.pregnancy
      ) continue;
    }

    // ------------------------
    // Medication criteria
    // ------------------------
    if (condition.drugs?.length) {
      medicationHistory.forEach(med => {
        const match = condition.drugs.some(d =>
          med.drug_name?.toLowerCase().includes(d.toLowerCase()) ||
          med.drug_class?.toLowerCase().includes(d.toLowerCase())
        );
        if (match) affectedMeds.push(med);
      });

      if (affectedMeds.length === 0) continue;

      if (condition.duration) {
        affectedMeds.forEach(med => {
          const days = extractDays(med.duration);
          if (condition.duration.min && days < condition.duration.min) {
            evidence.push(`${med.drug_name}: duration below recommended`);
          }
          if (condition.duration.max && days > condition.duration.max) {
            evidence.push(`${med.drug_name}: duration exceeds recommended`);
          }
        });
      }
    }

    // ------------------------
    // Laboratory criteria
    // ------------------------
    if (condition.labs?.length) {
      condition.labs.forEach(labRule => {
        const lab = patientData.labs?.find(
          l => l.use && l.name.toLowerCase() === labRule.name.toLowerCase()
        );
        if (!lab) return;

        const value = parseFloat(lab.value);
        if (Number.isNaN(value)) return;

        const violated =
          (labRule.op === ">" && value > labRule.value) ||
          (labRule.op === "<" && value < labRule.value) ||
          (labRule.op === ">=" && value >= labRule.value) ||
          (labRule.op === "<=" && value <= labRule.value);

        if (violated) {
          evidence.push(`${labRule.name} = ${value} ${labRule.op} ${labRule.value}`);
        }
      });
    }

    // ------------------------
    // Imaging criteria
    // ------------------------
    if (condition.imaging?.length) {
      condition.imaging.forEach(imgRule => {
        const img = patientData.imaging?.find(
          i =>
            i.use &&
            i.type === imgRule.type &&
            i.finding === imgRule.finding &&
            i.present === true
        );
        if (img) {
          evidence.push(`Imaging finding: ${imgRule.finding}`);
        }
      });
    }

    // ------------------------
    // Drug–Drug Interaction
    // ------------------------
    if (condition.interaction?.length && medicationHistory.length > 1) {
      condition.interaction.forEach(pair => {
        const hasA = medicationHistory.some(m => m.drug_class === pair[0]);
        const hasB = medicationHistory.some(m => m.drug_class === pair[1]);
        if (hasA && hasB) {
          evidence.push(`Interaction between ${pair[0]} and ${pair[1]}`);
        }
      });
    }

    // ------------------------
    // Final rule decision
    // ------------------------
    if (evidence.length > 0 || affectedMeds.length > 0) {
      detectedProblems.push({
        rule_name: rule.rule_name,
        rule_type: rule.rule_type, // DRN category used as rule type
        message: "There is a potential drug-related problem.",
        evidence,
        affected_medications: affectedMeds.map(m => m.drug_name),
        recommendation: rule.rule_action || "Review current therapy",
      });
    }
  }

  return detectedProblems;
};

// ------------------------
// Helper: duration → days
// ------------------------
const extractDays = (duration) => {
  if (!duration) return 0;
  const match = duration.match(/(\d+)\s*days?/i);
  return match ? parseInt(match[1]) : 0;
};
