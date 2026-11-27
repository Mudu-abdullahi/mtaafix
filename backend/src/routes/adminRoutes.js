
import express from 'express';

import {
  getAllReports,
  getAdminReportById,
  verifyReport,
  rejectReport,
  updateReportStatus,
  getDashboardStats,
  getAllCommunityUsers,
  updateCommunityUserStatus,
  getSystemSettings,
  updateSystemSettings,
} from '../controllers/adminController.js';

import {
  protect,
  authorize,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Community reports
router.get('/reports', getAllReports);
router.get('/reports/:id', getAdminReportById);
router.patch('/reports/:id/verify', verifyReport);
router.patch('/reports/:id/reject', rejectReport);
router.patch('/reports/:id/status', updateReportStatus);

// Community user management
router.get('/users', getAllCommunityUsers);
router.patch('/users/:id/status', updateCommunityUserStatus);

// System settings
router.get('/settings', getSystemSettings);
router.patch('/settings', updateSystemSettings);

export default router;
