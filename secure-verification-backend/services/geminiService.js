import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in .env");
}

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

// --- UPGRADED STRICT SCHEMA ---
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    "nameScore": { "type": "NUMBER", "description": "Strictly 1.0 (Match) or 0.1 (No Match)" },
    "nameReason": { "type": "STRING", "description": "Reasoning for the name score." },
    "dobScore": { "type": "NUMBER", "description": "Strictly 1.0 (Match) or 0.1 (No Match)" },
    "dobReason": { "type": "STRING", "description": "Reasoning for the DOB score." },
    "docTypeScore": { "type": "NUMBER", "description": "1.0 (Valid ID) or 0.1 (Invalid)" },
    "detectedFlags": {
      "type": "ARRAY",
      "items": { "type": "OBJECT", "properties": { "type": { "type": "STRING" }, "reason": { "type": "STRING" }, "severity": { "type": "STRING" }} }
    },
  },
};

export const verifyDocumentWithGemini = async (formData, ocrText) => {
  console.log("[Gemini] Starting STRICT Field-by-Field Analysis...");

  const systemPrompt = `
    You are a hyper-strict document verification AI. Your task is to compare user-provided data
    against raw OCR text. YOU MUST return a JSON object.

    SCORING RULES:
    - Your score for 'nameScore' and 'dobScore' MUST be **1.0** (if it matches) or **0.1** (if it does not match).
    - **nameScore**: Must be **1.0** ONLY if the User's first and last name are found in the OCR text. Typos or format differences (Rahul Sharma vs RAHUL SHARMA) are OK. Mismatched names (Rahul vs Rohan) are **0.1**.
    - **dobScore**: Must be **1.0** ONLY if the User's DOB (day, month, AND year) is found. Format differences (15-05-1998 vs 15/05/1998) are OK. Mismatched dates are **0.1**.
    - **docTypeScore**: Must be **1.0** if OCR text contains keywords like "Government", "India", "Aadhaar", "DOB". Otherwise, score **0.1**.
    - **detectedFlags**: If any score is 0.1, create a 'high' severity flag for it.
  `;

  const userPrompt = `
    User Provided Data:
    {
      "name": "${formData.name}",
      "dob": "${formData.dob}"
    }

    Raw OCR Text:
    "${ocrText}"
  `;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.0, // Zero temperature for strict grading
    },
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[Gemini] API Error:", response.status, errorBody);
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonText) {
      console.error("[Gemini] Invalid response structure:", result);
      throw new Error("Received an invalid response from Gemini API.");
    }

    const verificationData = JSON.parse(jsonText);
    console.log("[Gemini] Verification Complete:", verificationData);
    return verificationData;

  } catch (error) {
    console.error("Error in verifyDocumentWithGemini:", error);
    // Fail safe: Return 0 scores if AI fails
    return {
      nameScore: 0.1,
      nameReason: "API Error: Could not verify document.",
      dobScore: 0.1,
      dobReason: "API Error",
      docTypeScore: 0.1,
      detectedFlags: [{ type: "System", reason: "Verification API failed", severity: "high" }],
    };
  }
};