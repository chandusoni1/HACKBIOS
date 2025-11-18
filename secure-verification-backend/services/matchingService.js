import Fuse from 'fuse.js';

// Helper: Calculate Fuzzy Score (0 to 1)
// 1.0 = Perfect Match
// 0.0 = No Match
const getFuzzyScore = (textToSearch, wordToFind, threshold = 0.4) => {
  if (!textToSearch || !wordToFind) return 0.0;
  
  // Normalize text (lowercase)
  const cleanText = textToSearch.toLowerCase();
  const cleanWord = wordToFind.toLowerCase();

  // Direct Include Check (Best for exact matches)
  if (cleanText.includes(cleanWord)) return 1.0;

  // Fuse.js Check (Best for typos)
  const tokens = cleanText.split(/\s+/); // Split by spaces
  const fuse = new Fuse(tokens, {
    includeScore: true,
    threshold: threshold, 
    minMatchCharLength: 3,
  });

  const result = fuse.search(cleanWord);

  if (result.length > 0) {
    // Fuse gives 0 for perfect, 1 for bad. We invert it.
    // If Fuse score is 0.1 (good), we return 0.9.
    return 1 - result[0].score; 
  }
  
  return 0.0; 
};

export const validateData = (formData, ocrTextAadhaar, ocrTextCaste) => {
  const flags = [];
  
  // Ensure OCR text is not null
  const safeAadhaarText = ocrTextAadhaar || "";
  const safeCasteText = ocrTextCaste || "";

  // --- 1. Name Score ---
  // Compare First Name only (User's input vs Aadhaar)
  const firstName = formData.name.split(" ")[0];
  const nameScore = getFuzzyScore(safeAadhaarText, firstName, 0.4);
  
  if (nameScore < 0.6) {
    flags.push({ type: "Name", reason: "Name mismatch or text blurry.", severity: "high" });
  }

  // --- 2. DOB Score ---
  // Extract just the Year (e.g., "1998") because OCR often messes up "/" or "-"
  const dobYear = formData.dob ? formData.dob.split("-")[0] : "";
  let dobScore = 0.0;
  
  if (dobYear && safeAadhaarText.includes(dobYear)) {
    dobScore = 1.0; // Year found perfectly
  } else if (dobYear) {
    // Try fuzzy match on year if exact match fails
    dobScore = getFuzzyScore(safeAadhaarText, dobYear, 0.2);
  }

  if (dobScore < 0.8) {
    flags.push({ type: "DOB", reason: "Year of Birth not found in document.", severity: "high" });
  }

  // --- 3. Document Type Score ---
  // Check for keywords that prove it's an ID card
  let docTypeScore = 0.0;
  const lowerAadhaar = safeAadhaarText.toLowerCase();
  if (lowerAadhaar.includes("government") || lowerAadhaar.includes("india") || lowerAadhaar.includes("aadhaar") || lowerAadhaar.includes("dob") || lowerAadhaar.includes("yob")) {
    docTypeScore = 1.0;
  }
  
  if (docTypeScore < 0.5) {
    flags.push({ type: "Document", reason: "Document does not look like a valid ID.", severity: "medium" });
  }

  // --- 4. Category Score ---
  let categoryScore = 1.0; // Default perfect for General
  if (formData.category !== "General") {
    // Check if the category name exists in the Caste Certificate
    categoryScore = getFuzzyScore(safeCasteText, formData.category, 0.3);
    if (categoryScore < 0.6) {
      flags.push({ type: "Category", reason: `Certificate does not mention '${formData.category}'.`, severity: "high" });
    }
  }

  return {
    nameScore: parseFloat(nameScore.toFixed(2)),
    dobScore: parseFloat(dobScore.toFixed(2)),
    docTypeScore: parseFloat(docTypeScore.toFixed(2)),
    categoryScore: parseFloat(categoryScore.toFixed(2)),
    flags
  };
};