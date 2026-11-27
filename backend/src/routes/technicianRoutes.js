
import express from 'express';

import {
  createTechnician,
  getAllTechnicians,
  getTechnicianById,
  updateTechnician,
  updateTechnicianAvailability,
  updateTechnicianEmploymentStatus,
} from '../controllers/technicianController.js';

import {
  protect,
  authorize,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// All technician management routes require authentication.
router.use(protect);

// Only administrators can manage technician accounts.
router.use(authorize('admin'));

// Register a technician.
router.post('/', createTechnician);

// Get all technicians.
router.get('/', getAllTechnicians);

// Get one technician.
router.get('/:id', getTechnicianById);

// Update technician information.
router.patch('/:id', updateTechnician);

// Update availability.
router.patch('/:id/availability', updateTechnicianAvailability);

// Update employment status.
router.patch('/:id/employment-status', updateTechnicianEmploymentStatus);

export default router;
