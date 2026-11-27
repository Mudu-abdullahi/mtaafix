
import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    // Report being assigned
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
    },

    // Technician receiving the assignment
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician',
      required: true,
    },

    // Administrator who created the assignment
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },

    status: {
      type: String,
      enum: [
        'Assigned',
        'Accepted',
        'In Progress',
        'Completed',
        'Cancelled',
      ],
      default: 'Assigned',
    },

    instructions: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    completionNotes: {
      type: String,
      trim: true,
      default: '',
    },

    evidence: [
      {
        url: String,
        publicId: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Improve assignment queries
assignmentSchema.index({ technician: 1, status: 1 });
assignmentSchema.index({ report: 1 });
assignmentSchema.index({ assignedBy: 1, assignedAt: -1 });

const Assignment = mongoose.model(
  'Assignment',
  assignmentSchema
);

export default Assignment;
