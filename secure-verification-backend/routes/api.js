import express from 'express';
import { form1Upload, form2Upload, form3Upload } from '../middleware/FileUploadMiddleware.js';
import * as controller from '../controllers/verificationController.js'; // Import all exports as 'controller'
import security from '../middleware/security.js';

const router = express.Router();

// Apply security middleware to all API routes
router.use(security);

// === Form 1 (Personal) ===
// Matches: POST http://localhost:5000/api/submit-form
router.post('/submit-form', form1Upload, controller.submitApplication);

// === Form 2 (Education) ===
// Matches: POST http://localhost:5000/api/submit-education
router.post('/submit-education', form2Upload, controller.submitEducation);

// === Form 3 (Experience) - Placeholder ===
// Assuming a new endpoint for Form3.jsx
router.post('/submit-experience', form3Upload, controller.submitExperience);

// === Dashboard ===
// Matches: GET http://localhost:5000/api/applications
router.get('/applications', controller.getAllApplications);

// Matches: POST http://localhost:5000/api/applications/:id/status
router.post('/applications/:id/status', controller.updateStatus);

export default router;