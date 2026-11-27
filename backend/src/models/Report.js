
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    // Citizen who submitted the report
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Report information
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      enum: [
        'Pothole',
        'Broken Streetlight',
        'Blocked Drainage',
        'Garbage',
        'Water Leakage',
        'Exposed Electrical Wires',
        'Other',
      ],
      required: true,
    },

    // Report photograph
    image: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
    },

    // Location information
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },

      county: {
        type: String,
        default: '',
      },

      town: {
        type: String,
        default: '',
      },

      coordinates: {
        latitude: {
          type: Number,
          min: -90,
          max: 90,
        },

        longitude: {
          type: Number,
          min: -180,
          max: 180,
        },
      },
    },

    // Issue severity
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },

    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },

    // Report progress
    status: {
      type: String,
      enum: [
        'Pending',
        'Under Review',
        'Verified',
        'Assigned',
        'In Progress',
        'Resolved',
        'Rejected',
      ],
      default: 'Pending',
    },

    // Admin verification
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    // Assignment information
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician',
      default: null,
    },

    // Resolution information
    resolution: {
      description: {
        type: String,
        default: '',
      },

      evidence: [
        {
          url: String,
          publicId: String,
        },
      ],

      resolvedAt: {
        type: Date,
        default: null,
      },
    },

    // Citizen confirmation
    citizenConfirmed: {
      type: Boolean,
      default: false,
    },

    // Community engagement
    votes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Duplicate report tracking
    isDuplicate: {
      type: Boolean,
      default: false,
    },

    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster report searches
reportSchema.index({ reportedBy: 1, createdAt: -1 });
reportSchema.index({ status: 1, category: 1 });
reportSchema.index({ 'location.county': 1 });

// Geospatial index will be added when coordinates
// are migrated to GeoJSON format.

const Report = mongoose.model('Report', reportSchema);

export default Report;
