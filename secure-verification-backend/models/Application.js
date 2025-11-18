import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  // User ne form mein jo DOB bhara, use save karne ke liye
  dob: { type: String, required: true },
  
  status: { type: String, default: "Pending" },
  notes: { type: String },
  
  // Individual scores (Fuse.js se)
  extracted: {
    name_confidence: Number,
    dob_confidence: Number,
    aadhaar_confidence: Number,
    category_confidence: Number, 
  },

  // Raw OCR text (modal mein dikhane ke liye)
  ocrData: {
    aadhaar: { type: String, default: "" },
    caste: { type: String, default: "" },
  },

  // Flags
  flags: [
    {
      type: { type: String },
      reason: String,
      severity: String
    }
  ],

  // Document images (Base64)
  docs: {
    aadhaar: String,
    caste: String,
    disability: String
  },

  createdAt: { type: Date, default: Date.now }
});

// YEH LINE ZAROORI HAI:
const Application = mongoose.model("Application", ApplicationSchema);
export default Application; // Yahan 'default' export ho raha hai