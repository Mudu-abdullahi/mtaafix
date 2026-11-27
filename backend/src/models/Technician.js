
import mongoose from 'mongoose';

const technicianSchema = new mongoose.Schema(
  {
    // Link technician to their user account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      enum: [
        'Road Maintenance',
        'Electrical Repairs',
        'Drainage and Plumbing',
        'Waste Management',
        'Water Services',
        'General Maintenance',
        'Other',
      ],
    },

    skills: [{
      type: String,
      trim: true,
    }],

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    location: {
      county: {
        type: String,
        default: '',
      },
      town: {
        type: String,
        default: '',
      },
      address: {
        type: String,
        default: '',
      },
    },

    availability: {
      type: String,
      enum: ['Available', 'Busy', 'Unavailable'],
      default: 'Available',
    },

    employmentStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },

    experienceYears: {
      type: Number,
      min: 0,
      default: 0,
    },

    completedJobs: {
      type: Number,
      min: 0,
      default: 0,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    profileImage: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Improve technician searches
technicianSchema.index({ specialization: 1, availability: 1 });
technicianSchema.index({ employmentStatus: 1 });

const Technician = mongoose.model(
  'Technician',
  technicianSchema
);

export default Technician;
