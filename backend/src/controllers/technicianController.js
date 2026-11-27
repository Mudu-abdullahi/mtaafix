
import User from '../models/User.js';
import Technician from '../models/Technician.js';

// ========================================
// 1. REGISTER A NEW TECHNICIAN
// ========================================
export const createTechnician = async (req, res, next) => {
  let user;

  try {
    const {
      name,
      email,
      password,
      phone,
      employeeId,
      specialization,
      skills,
      location,
      experienceYears,
    } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password and specialization are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters.',
      });
    }

    const validSpecializations = [
      'Road Maintenance',
      'Electrical Repairs',
      'Drainage and Plumbing',
      'Waste Management',
      'Water Services',
      'General Maintenance',
      'Other',
    ];

    if (!validSpecializations.includes(specialization)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid technician specialization.',
        validSpecializations,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    if (employeeId) {
      const existingEmployee = await Technician.findOne({ employeeId });

      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message: 'This employee ID is already registered.',
        });
      }
    }

    // Create the technician's login account.
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone || '',
      role: 'technician',
    });

    // Create the technician's professional profile.
    const technician = await Technician.create({
      user: user._id,
      employeeId,
      specialization,
      skills: Array.isArray(skills) ? skills : [],
      phone: phone || '',
      location: location || {},
      experienceYears: experienceYears || 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Technician registered successfully.',
      technician,
    });
  } catch (error) {
    // Avoid leaving an account without a technician profile.
    if (user) {
      await User.findByIdAndDelete(user._id).catch(() => {});
    }

    next(error);
  }
};


// ========================================
// 2. GET ALL TECHNICIANS
// ========================================
export const getAllTechnicians = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.specialization) {
      filter.specialization = req.query.specialization;
    }

    if (req.query.availability) {
      filter.availability = req.query.availability;
    }

    if (req.query.employmentStatus) {
      filter.employmentStatus = req.query.employmentStatus;
    }

    const [technicians, total] = await Promise.all([
      Technician.find(filter)
        .populate('user', 'name email phone status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Technician.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: technicians.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      technicians,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 3. GET ONE TECHNICIAN BY ID
// ========================================
export const getTechnicianById = async (req, res, next) => {
  try {
    const technician = await Technician.findById(req.params.id)
      .populate('user', 'name email phone status');

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found.',
      });
    }

    return res.status(200).json({
      success: true,
      technician,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 4. UPDATE TECHNICIAN PROFILE
// ========================================
export const updateTechnician = async (req, res, next) => {
  try {
    const technician = await Technician.findById(req.params.id);

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found.',
      });
    }

    const {
      name,
      phone,
      employeeId,
      specialization,
      skills,
      location,
      experienceYears,
      availability,
      employmentStatus,
    } = req.body;

    const validSpecializations = [
      'Road Maintenance',
      'Electrical Repairs',
      'Drainage and Plumbing',
      'Waste Management',
      'Water Services',
      'General Maintenance',
      'Other',
    ];

    const validAvailability = [
      'Available',
      'Busy',
      'Unavailable',
    ];

    const validEmploymentStatuses = [
      'Active',
      'Inactive',
      'Suspended',
    ];

    if (
      specialization !== undefined &&
      !validSpecializations.includes(specialization)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid technician specialization.',
      });
    }

    if (
      availability !== undefined &&
      !validAvailability.includes(availability)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status.',
      });
    }

    if (
      employmentStatus !== undefined &&
      !validEmploymentStatuses.includes(employmentStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employment status.',
      });
    }

    if (employeeId !== undefined && employeeId !== technician.employeeId) {
      const existingEmployee = await Technician.findOne({
        employeeId,
        _id: { $ne: technician._id },
      });

      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message: 'This employee ID is already in use.',
        });
      }

      technician.employeeId = employeeId;
    }

    if (specialization !== undefined) {
      technician.specialization = specialization;
    }

    if (skills !== undefined) {
      technician.skills = skills;
    }

    if (phone !== undefined) {
      technician.phone = phone;
    }

    if (location !== undefined) {
      technician.location = location;
    }

    if (experienceYears !== undefined) {
      technician.experienceYears = experienceYears;
    }

    if (availability !== undefined) {
      technician.availability = availability;
    }

    if (employmentStatus !== undefined) {
      technician.employmentStatus = employmentStatus;
    }

    await technician.save();

    // Update the linked login account.
    if (name !== undefined || phone !== undefined) {
      const user = await User.findById(technician.user);

      if (user) {
        if (name !== undefined) {
          user.name = name.trim();
        }

        if (phone !== undefined) {
          user.phone = phone;
        }

        await user.save();
      }
    }

    await technician.populate('user', 'name email phone status');

    return res.status(200).json({
      success: true,
      message: 'Technician updated successfully.',
      technician,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 5. UPDATE TECHNICIAN AVAILABILITY
// ========================================
export const updateTechnicianAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;

    const validAvailability = [
      'Available',
      'Busy',
      'Unavailable',
    ];

    if (!validAvailability.includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid availability status.',
        validAvailability,
      });
    }

    const technician = await Technician.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Technician availability updated successfully.',
      technician,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 6. UPDATE TECHNICIAN EMPLOYMENT STATUS
// ========================================
export const updateTechnicianEmploymentStatus = async (req, res, next) => {
  try {
    const { employmentStatus } = req.body;

    const validStatuses = [
      'Active',
      'Inactive',
      'Suspended',
    ];

    if (!validStatuses.includes(employmentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid employment status.',
        validStatuses,
      });
    }

    const technician = await Technician.findByIdAndUpdate(
      req.params.id,
      { employmentStatus },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found.',
      });
    }

    // Keep the linked login account in sync when suspended.
    await User.findByIdAndUpdate(technician.user, {
      status: employmentStatus === 'Suspended' ? 'suspended' : 'active',
    });

    return res.status(200).json({
      success: true,
      message: 'Technician employment status updated successfully.',
      technician,
    });
  } catch (error) {
    next(error);
  }
};
