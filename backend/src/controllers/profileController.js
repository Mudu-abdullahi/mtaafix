
import User from '../models/User.js';

// ========================================
// 1. GET MY PROFILE
// ========================================
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      'name email phone role status createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 2. UPDATE MY PROFILE
// ========================================
export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty.',
      });
    }

    if (name !== undefined && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must contain at least 2 characters.',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    // Users can only update their name and phone number.
    if (name !== undefined) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
