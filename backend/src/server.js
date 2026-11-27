
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

import connectDB from './config/db.js';

// ========================================
// IMPORT ROUTES
// ========================================

import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import technicianRoutes from './routes/technicianRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import technicianJobRoutes from './routes/technicianJobRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// ========================================
// IMPORT ERROR MIDDLEWARE
// ========================================

import {
  notFound,
  errorHandler,
} from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();

// ========================================
// SECURITY MIDDLEWARE
// ========================================

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));

// ========================================
// BODY PARSING MIDDLEWARE
// ========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ========================================
// API ROUTES
// ========================================

// Authentication
app.use('/api/auth', authRoutes);

// Citizen reports
app.use('/api/reports', reportRoutes);

// Administrator management
app.use('/api/admin', adminRoutes);

// Notifications
app.use('/api/notifications', notificationRoutes);

// User profile
app.use('/api/profile', profileRoutes);

// Technician management
app.use('/api/technicians', technicianRoutes);

// Assignment management
app.use('/api/assignments', assignmentRoutes);

// Technician workspace
app.use('/api/technician', technicianJobRoutes);

// Citizen feedback and resolution confirmation
app.use('/api/feedback', feedbackRoutes);

// Administrator review moderation
app.use('/api/reviews', reviewRoutes);

// ========================================
// WELCOME ROUTE
// ========================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the MtaaFix API',
  });
});

// ========================================
// HEALTH CHECK
// ========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MtaaFix API is running successfully',
    environment: process.env.NODE_ENV || 'development',
  });
});

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================

app.use(notFound);
app.use(errorHandler);

// ========================================
// SERVER CONFIGURATION
// ========================================

const PORT = process.env.PORT || 5000;

// ========================================
// CONNECT DATABASE AND START SERVER
// ========================================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log('====================================');
      console.log('       MTAAFIX BACKEND API');
      console.log('====================================');
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Database connected successfully');
      console.log('====================================');
    });
  } catch (error) {
    console.error('Failed to start MtaaFix server:', error.message);
    process.exit(1);
  }
};

startServer();
