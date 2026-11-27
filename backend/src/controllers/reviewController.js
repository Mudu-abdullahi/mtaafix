
import Review from '../models/Review.js';
import Technician from '../models/Technician.js';

// ========================================
// HELPER: RECALCULATE TECHNICIAN RATING
// ========================================
const updateTechnicianRating = async (technicianId) => {
  if (!technicianId) return;

  const result = await Review.aggregate([
    {
      $match: {
        technician: technicianId,
        status: 'Approved',
      },
    },
    {
      $group: {
        _id: '$technician',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  const averageRating = result.length
    ? Math.round(result[0].averageRating * 10) / 10
    : 0;

  await Technician.findByIdAndUpdate(technicianId, {
    rating: averageRating,
  });
};


// ========================================
// 1. GET ALL REVIEWS
// ========================================
export const getAllReviews = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    const validStatuses = ['Pending', 'Approved', 'Rejected'];

    if (req.query.status) {
      if (!validStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid review status.',
          validStatuses,
        });
      }

      filter.status = req.query.status;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('reviewer', 'name email')
        .populate('report', 'title category status')
        .populate({
          path: 'technician',
          select: 'employeeId specialization rating',
          populate: {
            path: 'user',
            select: 'name email',
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Review.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      reviews,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 2. GET REVIEW BY ID
// ========================================
export const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('reviewer', 'name email')
      .populate('report', 'title category status')
      .populate({
        path: 'technician',
        select: 'employeeId specialization rating',
        populate: {
          path: 'user',
          select: 'name email',
        },
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 3. APPROVE REVIEW
// ========================================
export const approveReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    if (review.status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'This review has already been approved.',
      });
    }

    const previousTechnicianId = review.technician;

    review.status = 'Approved';
    review.isVerified = true;

    await review.save();

    await updateTechnicianRating(previousTechnicianId);

    return res.status(200).json({
      success: true,
      message: 'Review approved successfully.',
      review,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 4. REJECT REVIEW
// ========================================
export const rejectReview = async (req, res, next) => {
  try {
    const { adminResponse } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    if (review.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'This review has already been rejected.',
      });
    }

    const technicianId = review.technician;

    review.status = 'Rejected';
    review.isVerified = false;

    if (adminResponse !== undefined) {
      review.adminResponse = adminResponse;
    }

    await review.save();

    await updateTechnicianRating(technicianId);

    return res.status(200).json({
      success: true,
      message: 'Review rejected successfully.',
      review,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 5. RESPOND TO A REVIEW
// ========================================
export const respondToReview = async (req, res, next) => {
  try {
    const { adminResponse } = req.body;

    if (
      typeof adminResponse !== 'string' ||
      !adminResponse.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an administrator response.',
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    review.adminResponse = adminResponse.trim();

    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Response added successfully.',
      review,
    });
  } catch (error) {
    next(error);
  }
};
