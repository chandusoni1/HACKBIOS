import multer from 'multer';

// We use memoryStorage to get file buffers directly
// This is perfect for passing to the ocrService (Tesseract)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file limit
});

// Middleware to handle specific fields from Form1.jsx
// These names ('photo', 'casteCertificate') MUST match the frontend FormData
export const form1Upload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'casteCertificate', maxCount: 1 },
  { name: 'disabilityCertificate', maxCount: 1 }
]);

// Middleware to handle specific fields from Form2.jsx
export const form2Upload = upload.fields([
  { name: 'tenth_file', maxCount: 1 },
  { name: 'twelfth_file', maxCount: 1 },
  { name: 'degree_file', maxCount: 1 }
]);

// Middleware for Form3.jsx (assuming it has file uploads)
export const form3Upload = upload.fields([
  { name: 'experience_letter', maxCount: 1 },
  { name: 'salary_slip', maxCount: 1 }
]);