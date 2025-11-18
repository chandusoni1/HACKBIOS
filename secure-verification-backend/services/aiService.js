// This service generates human-readable flags based on confidence scores
export const generateFlags = (confidence) => {
  const flags = [];

  if (confidence.name_confidence < 0.5) {
    flags.push({
      type: "Name",
      reason: "Name mismatch between form and document",
      severity: "high"
    });
  }

  if (confidence.dob_confidence < 0.5) {
    flags.push({
      type: "DOB",
      reason: "Date of Birth mismatch or unreadable",
      severity: "medium"
    });
  }

  if (confidence.aadhaar_confidence < 0.7) {
    flags.push({
      type: "Document",
      reason: "OCR confidence low. Document may be blurry or invalid.",
      severity: "low"
    });
  }

  return flags;
};