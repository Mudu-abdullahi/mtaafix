
import express from 'express';

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// ========================================
// 1. GET MY NOTIFICATIONS
// GET /api/notifications
// ========================================
router.get('/', getMyNotifications);

// ========================================
// 2. MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// ========================================
router.patch('/read-all', markAllNotificationsAsRead);

// ========================================
// 3. MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// ========================================
router.patch('/:id/read', markNotificationAsRead);

// ========================================
// 4. DELETE ONE NOTIFICATION
// DELETE /api/notifications/:id
// ========================================
router.delete('/:id', deleteNotification);

export default router;
