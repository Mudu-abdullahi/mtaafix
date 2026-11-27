
import express from 'express';

import {
  getMyJobs,
  getMyJobById,
  acceptJob,
  startJob,
  completeJob,
  updateMyAvailability,
} from '../controllers/technicianJobController.js';

import {
  protect,
  authorize,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Require authentication.
router.use(protect);

// Only logged-in technicians can access these routes.
router.use(authorize('technician'));

// View all my assigned jobs.
router.get('/jobs', getMyJobs);

// Update my availability.
router.patch('/availability', updateMyAvailability);

// Accept an assignment.
router.patch('/jobs/:id/accept', acceptJob);

// Start an assignment.
router.patch('/jobs/:id/start', startJob);

// Complete an assignment.
router.patch('/jobs/:id/complete', completeJob);

// View one assignment.
router.get('/jobs/:id', getMyJobById);

export default router;
