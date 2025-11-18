import multer from 'multer';

// Store files in memory buffer only
const storage = multer.memoryStorage();

// --- UPDATED ---
// We now accept PDF, as marksheets or caste certificates might be PDFs.
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, or PDF allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
});

// --- UPDATED ---
// These names must match the 'name' attribute in your frontend <input type="file">
// Or the key you use in FormData.append()
const uploadFields = upload.fields([
  // Academic Docs (for verification)
  { name: 'class10Marksheet', maxCount: 1 },
  { name: 'class12Marksheet', maxCount: 1 },
  { name: 'degreeCertificate', maxCount: 1 },

  // Personal Docs (for storage)
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'signature', maxCount: 1 },

  // Optional Docs (for storage)
  { name: 'casteCertificate', maxCount: 1 },
]);

export default uploadFields;