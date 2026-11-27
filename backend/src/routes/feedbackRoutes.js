
import express from 'express';

import {
  confirmReportResolution,
  createTechnicianReview,
  getMyReviews,
} from '../controllers/feedbackController.js';

import {
  protect,
  authorize,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// All feedback routes require authentication.
router.use(protect);

// Only citizens can confirm reports and submit reviews.
router.use(authorize('citizen'));

// Confirm that a reported problem has been fixed.
router.patch(
  '/reports/:id/confirm',
  confirmReportResolution
);

// Submit a review for a completed report.
router.post(
  '/reports/:id/review',
  createTechnicianReview
);

// View my submitted reviews.
router.get(
  '/my-reviews',
  getMyReviews
);

export default router;
