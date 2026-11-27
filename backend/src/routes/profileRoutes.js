
import express from 'express';

import {
  getMyProfile,
  updateMyProfile,
} from '../controllers/profileController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All profile routes require authentication
router.use(protect);

// GET /api/profile
router.get('/', getMyProfile);

// PATCH /api/profile
router.patch('/', updateMyProfile);

export default router;
