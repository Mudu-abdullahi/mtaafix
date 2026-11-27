
import express from 'express';

import {
  createReport,
  getMyReports,
  getReportById,
  updateMyReport,
} from '../controllers/reportController.js';

import {
  protect,
  authorize,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// ========================================
// ALL REPORT ROUTES REQUIRE AUTHENTICATION
// ========================================
router.use(protect);

// ========================================
// 1. CITIZEN: SUBMIT A COMMUNITY REPORT
// POST /api/reports
// ========================================
router.post(
  '/',
  authorize('citizen'),
  createReport
);

// ========================================
// 2. CITIZEN: GET THEIR OWN REPORTS
// GET /api/reports/mine
// ========================================
router.get(
  '/mine',
  authorize('citizen'),
  getMyReports
);

// ========================================
// 3. CITIZEN: UPDATE THEIR OWN PENDING REPORT
// PATCH /api/reports/:id
// ========================================
router.patch(
  '/:id',
  authorize('citizen'),
  updateMyReport
);

// ========================================
// 4. GET A REPORT BY ID
// GET /api/reports/:id
// Access is checked inside the controller
// ========================================
router.get(
  '/:id',
  getReportById
);

export default router;
