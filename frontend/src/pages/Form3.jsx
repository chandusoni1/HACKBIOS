// import React, { useState, useRef } from "react";
// export default function DRDOForm3() {
//   const [photoFile, setPhotoFile] = useState(null);
//   const [photoPreview, setPhotoPreview] = useState(null);
//   const [photoError, setPhotoError] = useState("");

//   const [signatureFile, setSignatureFile] = useState(null);
//   const [signaturePreview, setSignaturePreview] = useState(null);
//   const [signatureError, setSignatureError] = useState("");

//   const [aadhaar, setAadhaar] = useState("");
//   const [aadhaarError, setAadhaarError] = useState("");

//   const [casteFile, setCasteFile] = useState(null);
//   const [disability, setDisability] = useState("No");
//   const [disabilityFile, setDisabilityFile] = useState(null);
//   const [disabilityError, setDisabilityError] = useState("");

//   const [submitError, setSubmitError] = useState("");
//   const [submitted, setSubmitted] = useState(false);
//   const applicationIdRef = useRef(null);

//   // Helpers
//   const KB = 1024;

//   function resetPhotoState() {
//     setPhotoError("");
//     setPhotoFile(null);
//     setPhotoPreview(null);
//   }

//   function handleImageValidation(file, { maxKB, minWidth, minHeight, aspectTolerance = 0.4 }) {
//     // returns Promise that resolves to { ok: boolean, message?: string, previewUrl?: string }
//     return new Promise((resolve) => {
//       if (!file) return resolve({ ok: false, message: "No file provided" });

//       const allowed = ["image/jpeg", "image/jpg", "image/png"];
//       if (!allowed.includes(file.type)) {
//         return resolve({ ok: false, message: "Supported formats: JPG / JPEG / PNG" });
//       }

//       if (file.size > maxKB * KB) {
//         return resolve({ ok: false, message: `File too large. Max ${maxKB} KB allowed.` });
//       }

//       // check dimensions
//       const url = URL.createObjectURL(file);
//       const img = new Image();
//       img.onload = () => {
//         const w = img.naturalWidth;
//         const h = img.naturalHeight;
//         URL.revokeObjectURL(url);

//         // aspect ratio tolerance: compare w/h to expected square or rectangular
//         // For passport photo we expect roughly square (aspectTolerance smaller)
//         // For signature we expect wider rectangle (aspectTolerance larger)
//         const ratio = w / h;

//         // Accept if both width & height at least min
//         if (w < minWidth || h < minHeight) {
//           return resolve({
//             ok: false,
//             message: `Image resolution too small. Minimum ${minWidth}×${minHeight}px recommended.`,
//           });
//         }

//         // aspect tolerance: e.g., for square expected ratio ~1, tolerance 0.4 => accept 0.6—1.4
//         const lower = 1 - aspectTolerance;
//         const upper = 1 + aspectTolerance;
//         if (ratio < lower || ratio > upper) {
//           return resolve({
//             ok: true,
//             message: `Uploaded image has atypical aspect ratio (w/h=${ratio.toFixed(
//               2
//             )}). It may still work but please ensure it's a proper passport-style photo.`,
//             previewUrl: url,
//           });
//         }

//         // all good
//         return resolve({ ok: true, previewUrl: url });
//       };
//       img.onerror = () => {
//         URL.revokeObjectURL(url);
//         resolve({ ok: false, message: "Unable to read image file." });
//       };
//       img.src = url;
//     });
//   }

//   // Photo handler (passport)
//   const onPhotoChange = async (e) => {
//     setPhotoError("");
//     const file = e.target.files[0];
//     if (!file) {
//       resetPhotoState();
//       return;
//     }

//     // passport: <=200KB, min 400x400, aspectTolerance small (square)
//     const res = await handleImageValidation(file, { maxKB: 200, minWidth: 400, minHeight: 400, aspectTolerance: 0.3 });
//     if (!res.ok) {
//       setPhotoError(res.message);
//       setPhotoFile(null);
//       setPhotoPreview(res.previewUrl || null);
//       return;
//     }

//     setPhotoFile(file);
//     setPhotoPreview(res.previewUrl || null);
//     setPhotoError(res.message || "");
//   };

//   // Signature handler
//   const onSignatureChange = async (e) => {
//     setSignatureError("");
//     const file = e.target.files[0];
//     if (!file) {
//       setSignatureFile(null);
//       setSignaturePreview(null);
//       return;
//     }

//     // signature: <=100KB, min width 300, min height 80, aspectTolerance larger (wider)
//     const res = await handleImageValidation(file, { maxKB: 100, minWidth: 300, minHeight: 80, aspectTolerance: 1.2 });
//     if (!res.ok) {
//       setSignatureError(res.message);
//       setSignatureFile(null);
//       setSignaturePreview(res.previewUrl || null);
//       return;
//     }

//     setSignatureFile(file);
//     setSignaturePreview(res.previewUrl || null);
//     setSignatureError(res.message || "");
//   };

//   const onCasteFileChange = (e) => {
//     const f = e.target.files[0];
//     if (!f) {
//       setCasteFile(null);
//       return;
//     }
//     // allow pdf or image, max 500KB
//     const okTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
//     if (!okTypes.includes(f.type)) {
//       alert("Caste certificate: upload PDF or JPG/PNG.");
//       return;
//     }
//     if (f.size > 500 * KB) {
//       alert("Caste certificate too large (max 500KB).");
//       return;
//     }
//     setCasteFile(f);
//   };

//   const onDisabilityFileChange = (e) => {
//     const f = e.target.files[0];
//     setDisabilityError("");
//     if (!f) {
//       setDisabilityFile(null);
//       return;
//     }
//     const okTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
//     if (!okTypes.includes(f.type)) {
//       setDisabilityError("Upload PDF or JPG/PNG.");
//       return;
//     }
//     if (f.size > 500 * KB) {
//       setDisabilityError("File too large. Max 500KB.");
//       return;
//     }
//     setDisabilityFile(f);
//   };

//   // Aadhaar validation: 12 digits, starting 2-9 (simple)
//   const validateAadhaar = (value) => {
//     const cleaned = value.replace(/\s+/g, "");
//     const pattern = /^[2-9]\d{11}$/;
//     return pattern.test(cleaned);
//   };

//   const handleAadhaarChange = (e) => {
//     setAadhaarError("");
//     setAadhaar(e.target.value);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setSubmitError("");

//     // Basic checks
//     if (!photoFile) {
//       setSubmitError("Please upload passport photo (required).");
//       return;
//     }
//     if (!signatureFile) {
//       setSubmitError("Please upload signature (required).");
//       return;
//     }
//     if (!aadhaar || !validateAadhaar(aadhaar)) {
//       setSubmitError("Please enter a valid 12-digit Aadhaar number.");
//       return;
//     }
//     if (disability === "Yes" && !disabilityFile) {
//       setSubmitError("Disability certificate required when you selected 'Yes'.");
//       return;
//     }

//     // All good -> simulate submission
//     // Generate a simple application id
//     const id = "DRDO-" + Math.random().toString(36).slice(2, 9).toUpperCase();
//     applicationIdRef.current = id;
//     setSubmitted(true);

//     // Normally you'd send form data/files to backend here.
//     console.log("SUBMITTING", {
//       applicationId: id,
//       aadhaar,
//       photoFile,
//       signatureFile,
//       casteFile,
//       disability,
//     });
//   };

//   if (submitted) {
//     return (
//       <div className="min-h-screen bg-[#0A1D3B] flex items-center justify-center p-6">
//         <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl text-center">
//           <h2 className="text-2xl font-bold text-[#0A1D3B] mb-4">Application Submitted</h2>
//           <p className="mb-4">Thank you — your application has been submitted successfully.</p>
//           {/* <p className="mb-6">Your Application ID: <span className="font-mono bg-gray-100 px-3 py-1 rounded">{applicationIdRef.current}</span></p> */}
//           {/* <button
//             onClick={() => window.location.reload()}
//             className="bg-[#0A1D3B] text-white px-6 py-2 rounded"
//           >
//             Start New Application
//           </button> */}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0A1D3B] flex justify-center py-12 px-4">
//       <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-xl border border-[#1A3A6B]">
//         <h1 className="text-2xl font-bold text-[#0A1D3B] mb-2">Document Upload </h1>
//         <p className="text-sm text-gray-600 mb-6">
          
//         </p>

//         {/* Photo (passport) */}
//         <section className="mb-6">
//           <div className="flex items-start justify-between">
//             <div>
//               <h3 className="font-semibold text-[#0A1D3B]">Passport Photo</h3>
//               <p className="text-sm text-gray-600">
//                 Recommended: square passport-style photo (~600×600 px), JPG/PNG, max <strong>200 KB</strong>. Light background, full face visible.
//               </p>
//             </div>
//             <div className="text-sm text-gray-500">Required</div>
//           </div>

//           <div className="mt-3 flex gap-4 items-center">
//             <input accept="image/*" onChange={onPhotoChange} type="file" className="p-2 border rounded" />
//             {photoPreview && (
//               <img src={photoPreview} alt="photo preview" className="w-20 h-20 object-cover rounded border" />
//             )}
//           </div>
//           {photoError && <p className="text-sm text-red-600 mt-2">{photoError}</p>}
//         </section>

//         {/* Signature */}
//         <section className="mb-6">
//           <div className="flex items-start justify-between">
//             <div>
//               <h3 className="font-semibold text-[#0A1D3B]">Signature (Govt exam style)</h3>
//               <p className="text-sm text-gray-600">
//                 Use black or blue ink signature on a white background. Recommended size ~350×150 px, JPG/PNG, max <strong>100 KB</strong>.
//                 Avoid heavy filters — scanned clean signature is preferred.
//               </p>
//             </div>
//             <div className="text-sm text-gray-500">Required</div>
//           </div>

//           <div className="mt-3 flex gap-4 items-center">
//             <input accept="image/*" onChange={onSignatureChange} type="file" className="p-2 border rounded" />
//             {signaturePreview && (
//               <img src={signaturePreview} alt="signature preview" className="w-40 h-14 object-contain rounded border bg-white" />
//             )}
//           </div>
//           {signatureError && <p className="text-sm text-red-600 mt-2">{signatureError}</p>}
//         </section>

//         {/* Aadhaar */}
//         <section className="mb-6">
//           <label className="block font-semibold text-[#0A1D3B]">Aadhaar Number</label>
//           <p className="text-sm text-gray-600 mb-2">Enter 12-digit Aadhaar number (numbers only).</p>
//           <input
//             type="text"
//             maxLength={12}
//             value={aadhaar}
//             onChange={handleAadhaarChange}
//             placeholder="e.g. 123412341234"
//             className="w-full p-3 border rounded"
//           />
//           {aadhaar && !validateAadhaar(aadhaar) && <p className="text-sm text-red-600 mt-2">Invalid Aadhaar number.</p>}
//         </section>

//         {/* Caste Certificate */}
//         <section className="mb-6">
//           <label className="block font-semibold text-[#0A1D3B]">Caste Certificate (if applicable)</label>
//           <p className="text-sm text-gray-600 mb-2">Optional — PDF or image, max 500 KB.</p>
//           <input accept=".pdf,image/*" onChange={onCasteFileChange} type="file" className="p-2 border rounded" />
//           {casteFile && <p className="text-sm mt-2">Selected: {casteFile.name}</p>}
//         </section>

//         {/* Disability */}
//         <section className="mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <label className="block font-semibold text-[#0A1D3B]">Disability</label>
//               <p className="text-sm text-gray-600">Are you a person with disability?</p>
//             </div>
//             <select value={disability} onChange={(e) => { setDisability(e.target.value); setDisabilityError(""); }} className="p-2 border rounded">
//               <option value="No">No</option>
//               <option value="Yes">Yes</option>
//             </select>
//           </div>

//           {disability === "Yes" && (
//             <div className="mt-3">
//               <p className="text-sm text-gray-600 mb-2">Upload Disability Certificate (PDF or image, max 500 KB)</p>
//               <input accept=".pdf,image/*" onChange={onDisabilityFileChange} type="file" className="p-2 border rounded" />
//               {disabilityError && <p className="text-sm text-red-600 mt-2">{disabilityError}</p>}
//               {disabilityFile && <p className="text-sm mt-2">Selected: {disabilityFile.name}</p>}
//             </div>
//           )}
//         </section>

//         {submitError && <div className="mb-4 text-sm text-red-600">{submitError}</div>}

//         <div className="flex justify-end">
//           <button type="submit" className="bg-[#0A1D3B] text-white px-6 py-2 rounded-lg">
//             Submit Application
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
