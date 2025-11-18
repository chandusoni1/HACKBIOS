import { extractText } from '../services/ocrService.js';
import { validateData } from '../services/matchingService.js';
import Application from '../models/Application.js'; 

// 1. Handle Form 1 (Personal) Submission
export const submitApplication = async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;

    // --- 1. DUPLICATE CHECK ---
    const existingApp = await Application.findOne({ 
      name: formData.name, 
      category: formData.category 
    });
    if (existingApp) {
      return res.status(200).json({
        message: "Application already submitted",
        applicationId: existingApp._id
      });
    }

    console.log(`Processing: ${formData.name} (${formData.category})`);

    // --- 2. Run OCR ---
    let ocrTextAadhaar = "";
    let ocrTextCaste = "";
    let aadhaarDocUrl = "https://placehold.co/400x250/eee/ccc?text=No+File";
    let casteDocUrl = null;

    if (files && files.photo) {
      const aadhaarFile = files.photo[0];
      aadhaarDocUrl = `data:${aadhaarFile.mimetype};base64,${aadhaarFile.buffer.toString('base64')}`;
      ocrTextAadhaar = await extractText(aadhaarFile.buffer);
    }
    if (files && files.casteCertificate) {
      const casteFile = files.casteCertificate[0];
      casteDocUrl = `data:${casteFile.mimetype};base64,${casteFile.buffer.toString('base64')}`;
      ocrTextCaste = await extractText(casteFile.buffer);
    }

    // --- 3. Run Fuse.js Verification ---
    const verification = validateData(formData, ocrTextAadhaar, ocrTextCaste);
    const { nameScore, dobScore, docTypeScore, categoryScore, flags } = verification;

    // --- 4. SCORING LOGIC (Traffic Light) ---
    
    // Calculate Weighted Average
    // Name is most important (40%), then DOB (30%), Category (20%), Is it an ID? (10%)
    let finalScorePercent = (nameScore * 0.4) + (dobScore * 0.3) + (categoryScore * 0.2) + (docTypeScore * 0.1);
    
    let status = "Red"; 
    let notes = "Verification failed.";
    let finalFlags = flags;

    console.log(`[Scores] Name:${nameScore} DOB:${dobScore} Cat:${categoryScore} | Final: ${finalScorePercent.toFixed(2)}`);

    // --- TRAFFIC LIGHT LOGIC ---

    // CONDITION 1: RED (Critical Failure)
    // If Name is completely wrong, it's Red regardless of other scores.
    if (nameScore < 0.4) {
      status = "Red";
      notes = "Critical: Name mismatch on ID card.";
    } 
    // CONDITION 2: GREEN (Auto-Verify)
    // High score AND essential fields are reasonably matched
    else if (finalScorePercent >= 0.80 && nameScore > 0.7 && dobScore > 0.7) {
      status = "Green";
      notes = "Auto-verified successfully.";
      finalFlags = []; // Clear flags for Green status so it looks clean
    } 
    // CONDITION 3: YELLOW (Pending Review)
    // Score is okay, but maybe DOB matches poorly or Category is blurry
    else if (finalScorePercent >= 0.50) {
      status = "Yellow";
      notes = "Partial match. Manual review required.";
    } 
    // CONDITION 4: RED (Low Score)
    else {
      status = "Red";
      notes = "Low confidence score due to poor document quality or mismatch.";
    }

    // --- 5. Save to MongoDB ---
    const newApplication = await Application.create({
      name: formData.name,
      category: formData.category,
      dob: formData.dob, 
      status: status,
      extracted: {
        name_confidence: nameScore,
        dob_confidence: dobScore,
        aadhaar_confidence: docTypeScore,
        category_confidence: categoryScore, 
      },
      ocrData: {
        aadhaar: ocrTextAadhaar,
        caste: ocrTextCaste,
      },
      flags: finalFlags,
      notes: notes,
      docs: {
        aadhaar: aadhaarDocUrl,
        caste: casteDocUrl,
        disability: (files && files.disabilityCertificate) ? `data:${files.disabilityCertificate[0].mimetype};base64,${files.disabilityCertificate[0].buffer.toString('base64')}` : null,
      }
    });

    console.log(`Saved Status: ${status}`);

    res.status(200).json({
      message: "Application processed",
      applicationId: newApplication._id,
      status: status 
    });

  } catch (error) {
    console.error("Error in submitApplication:", error);
    res.status(500).json({ message: "Server error processing application." });
  }
};

// --- Other Functions ---

export const submitEducation = async (req, res) => {
    res.status(200).json({ message: "Saved" });
};

export const submitExperience = async (req, res) => {
    res.status(200).json({ message: "Saved" });
};

export const getAllApplications = async (req, res) => {
  try {
    const apps = await Application.find().sort({ createdAt: -1 });
    const formattedApps = apps.map(app => ({ ...app._doc, id: app._id }));
    res.status(200).json(formattedApps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching data" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    let updateData = { status };
    
    // Logic for manual override
    if (status === "Green") {
      updateData.flags = [];
      updateData.notes = "Manually approved by Scientist.";
    } else if (status === "Red") {
      updateData.notes = "Manually rejected by Scientist.";
    }

    const updatedApp = await Application.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedApp) return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ ...updatedApp._doc, id: updatedApp._id });
  } catch (error) {
    console.error("Error in updateStatus:", error);
    res.status(500).json({ message: "Server error updating status." });
  }
};