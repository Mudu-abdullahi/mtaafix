
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    // User receiving the notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      enum: [
        'Report Submitted',
        'Report Updated',
        'Report Verified',
        'Report Rejected',
        'Assignment Created',
        'Assignment Accepted',
        'Job Started',
        'Job Completed',
        'Report Resolved',
        'System Alert',
        'General',
      ],
      default: 'General',
    },

    // Related report, if applicable
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      default: null,
    },

    // Related assignment, if applicable
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    // Optional navigation destination in the application
    actionUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Efficient notification queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model(
  'Notification',
  notificationSchema
);

export default Notification;
