
import express from 'express';

import {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  cancelAssignment,
} from '../controllers/assignmentController.js';

import {
  protect,
  authorize,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Require authentication.
router.use(protect);

// Only administrators can manage assignments.
router.use(authorize('admin'));

// Create a new assignment.
router.post('/', createAssignment);

// Get all assignments.
router.get('/', getAllAssignments);

// Get one assignment.
router.get('/:id', getAssignmentById);

// Cancel an assignment.
router.patch('/:id/cancel', cancelAssignment);

export default router;
