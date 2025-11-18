import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DRDOApplicationForm() {
  const navigate = useNavigate();

  // 1. Initial State: Removed 'aadhaar' (number), KEPT 'photo' (file)
  const initialState = {
    name: "",
    fatherName: "",
    gender: "",
    category: "",
    nationality: "",
    dob: "",
    permanentAddress: "",
    photo: null, // Kept this
    casteCertificate: null,
    disabilityStatus: "",
    disabilityCertificate: null,
  };

  const [formData, setFormData] = useState(initialState);

  // We need this preview state back for the Aadhaar Upload
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [previewCaste, setPreviewCaste] = useState(null);
  const [previewDisability, setPreviewDisability] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      // Restored Photo Preview Logic
      if (name === "photo") setPreviewPhoto(URL.createObjectURL(file));
      if (name === "casteCertificate") setPreviewCaste(URL.createObjectURL(file));
      if (name === "disabilityCertificate") setPreviewDisability(URL.createObjectURL(file));

      setFormData({ ...formData, [name]: file });
    } else {
      let sanitizedValue = value;

      // --- MATCH LOGIC ---
      // Only allow Alphabets, Spaces, and Dots for Names/Nationality
      if (["name", "fatherName", "nationality"].includes(name)) {
        sanitizedValue = value.replace(/[^A-Za-z\s.]/g, "");
      }

      setFormData({ ...formData, [name]: sanitizedValue });
    }
  };

  const validateForm = () => {
    const nameRegex = /^[A-Za-z\s.]+$/;

    if (!formData.name.trim()) return "Please enter your Full Name.";
    if (!nameRegex.test(formData.name)) return "Name should only contain letters.";

    if (!formData.fatherName.trim()) return "Please enter Father's Name.";
    if (!nameRegex.test(formData.fatherName)) return "Father's Name should only contain letters.";

    if (!formData.gender) return "Please select your Gender.";
    if (!formData.category) return "Please select your Category.";

    if (!formData.nationality.trim()) return "Please enter Nationality.";
    if (!nameRegex.test(formData.nationality)) return "Nationality should only contain letters.";

    if (!formData.dob) return "Please enter Date of Birth.";
    
    if (!formData.permanentAddress.trim()) return "Please enter Permanent Address.";

    // Kept Validation for Aadhaar Photo Upload
    if (!formData.photo) return "Please upload Aadhaar Photo.";

    if (
      ["OBC", "SC", "ST"].includes(formData.category) &&
      !formData.casteCertificate
    ) {
      return "Please upload your Caste Certificate.";
    }
    if (
      formData.disabilityStatus === "Yes" &&
      !formData.disabilityCertificate
    ) {
      return "Please upload Disability Certificate.";
    }

    return null;
  };

  const handleNext = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    const submissionData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        submissionData.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_API}/api/submit-form`, {
        method: "POST",
        body: submissionData,
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Server response:", result);

        // --- CLEAR FORM LOGIC ---
        setFormData(initialState);
        
        // Clear all previews
        setPreviewPhoto(null); 
        setPreviewCaste(null);
        setPreviewDisability(null);
        
        // Reset HTML inputs (clears file filenames)
        e.target.reset(); 

        navigate("/form2");
      } else {
        alert(result.message || "Submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Network error: Could not connect to server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1D3B] flex justify-center py-10 px-4">
      <form
        onSubmit={handleNext}
        className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl border border-[#1A3A6B]"
      >
        <h1 className="text-3xl font-bold text-[#0A1D3B] mb-6 text-center">
          DRDO Application Form
        </h1>

        <h2 className="text-xl font-semibold text-[#0A1D3B] mb-4">
          Personal Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Full Name"
            onChange={handleChange}
            pattern="[A-Za-z\s.]+"
            title="Only letters allowed"
            required
            className="p-3 border rounded-xl"
          />

          <input
            type="text"
            name="fatherName"
            value={formData.fatherName}
            placeholder="Father's Name"
            onChange={handleChange}
            pattern="[A-Za-z\s.]+"
            title="Only letters allowed"
            required
            className="p-3 border rounded-xl"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="p-3 border rounded-xl"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="p-3 border rounded-xl"
          >
            <option value="">Select Category</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>

          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            placeholder="Nationality"
            onChange={handleChange}
            pattern="[A-Za-z\s]+"
            title="Only letters allowed"
            required
            className="p-3 border rounded-xl"
          />

          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            max={today}
            required
            className="p-3 border rounded-xl"
          />
          
          {/* REMOVED: Aadhaar Number Input */}
        </div>

        <h2 className="text-xl font-semibold text-[#0A1D3B] mt-8 mb-3">
          Address & Documents
        </h2>

        <textarea
          name="permanentAddress"
          value={formData.permanentAddress}
          placeholder="Permanent Address"
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-xl mb-6"
        ></textarea>

        {/* KEPT: Aadhaar Photo Upload Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full">
            <label className="block mb-2 font-semibold text-[#0A1D3B]">
              Upload Aadhaar Card Photo <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              required={!formData.photo} // Required if not uploaded yet
              className="p-3 border rounded-xl bg-gray-50 w-full"
            />

            {previewPhoto && (
              <img
                src={previewPhoto}
                alt="Preview"
                className="w-20 h-20 mt-3 object-cover border rounded-lg"
              />
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block mb-1 font-semibold text-[#0A1D3B]">
            Upload Caste Certificate {["OBC", "SC", "ST"].includes(formData.category) && <span className="text-red-500">*</span>}
          </label>

          <input
            type="file"
            name="casteCertificate"
            accept="image/*,application/pdf"
            onChange={handleChange}
            className="p-3 border rounded-xl bg-gray-50 w-full"
          />

          {previewCaste && (
            <img
              src={previewCaste}
              alt="Preview"
              className="w-20 h-20 mt-3 object-cover border rounded-lg"
            />
          )}
        </div>

        <div className="mt-6">
          <label className="block mb-2 font-semibold text-[#0A1D3B]">
            Disability Status
          </label>

          <select
            name="disabilityStatus"
            value={formData.disabilityStatus}
            onChange={handleChange}
            required
            className="p-3 border rounded-xl w-full"
          >
            <option value="">Select</option>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {formData.disabilityStatus === "Yes" && (
          <div className="mt-6">
            <label className="block mb-1 font-semibold text-[#0A1D3B]">
              Upload Disability Certificate <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              name="disabilityCertificate"
              accept="image/*,application/pdf"
              onChange={handleChange}
              required
              className="p-3 border rounded-xl bg-gray-50 w-full"
            />

            {previewDisability && (
              <img
                src={previewDisability}
                alt="Preview"
                className="w-20 h-20 mt-3 object-cover border rounded-lg"
              />
            )}
          </div>
        )}

        <button
          type="submit"
          className="ml-auto mt-10 bg-[#0A1D3B] text-white py-2 px-6 rounded-lg hover:bg-[#132E59] transition block"
        >
          Next
        </button>
      </form>
    </div>
  );
}