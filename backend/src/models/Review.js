
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // Citizen who submitted the review
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Report associated with the completed work
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
    },

    // Technician being reviewed
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician',
      default: null,
    },

    // Rating from 1 to 5 stars
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },

    // Review moderation status
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    adminResponse: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a citizen from reviewing the same report more than once
reviewSchema.index(
  { reviewer: 1, report: 1 },
  { unique: true }
);

// Help retrieve reviews for a technician
reviewSchema.index({ technician: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
