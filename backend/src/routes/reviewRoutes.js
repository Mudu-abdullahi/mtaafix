
import express from 'express';

import {
  getAllReviews,
  getReviewById,
  approveReview,
  rejectReview,
  respondToReview,
} from '../controllers/reviewController.js';

import {
  protect,
  authorize,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Require authentication.
router.use(protect);

// Only administrators can moderate reviews.
router.use(authorize('admin'));

// Get all reviews.
router.get('/', getAllReviews);

// Get one review.
router.get('/:id', getReviewById);

// Approve a review.
router.patch('/:id/approve', approveReview);

// Reject a review.
router.patch('/:id/reject', rejectReview);

// Respond to a review.
router.patch('/:id/respond', respondToReview);

export default router;
