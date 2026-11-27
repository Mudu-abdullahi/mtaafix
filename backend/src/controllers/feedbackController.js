
import Report from '../models/Report.js';
import Review from '../models/Review.js';
import Assignment from '../models/Assignment.js';

// ========================================
// 1. CITIZEN CONFIRMS RESOLVED REPORT
// ========================================
export const confirmReportResolution = async (req, res, next) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      reportedBy: req.user._id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    if (report.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Only resolved reports can be confirmed.',
      });
    }

    if (report.citizenConfirmed) {
      return res.status(400).json({
        success: false,
        message: 'You have already confirmed this report.',
      });
    }

    report.citizenConfirmed = true;
    await report.save();

    return res.status(200).json({
      success: true,
      message: 'Thank you! You have confirmed that the problem was resolved.',
      report,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 2. CITIZEN SUBMITS A TECHNICIAN REVIEW
// ========================================
export const createTechnicianReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !Number.isInteger(Number(rating)) ||
        Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating between 1 and 5.',
      });
    }

    if (comment !== undefined && typeof comment !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Comment must be text.',
      });
    }

    const report = await Report.findOne({
      _id: req.params.id,
      reportedBy: req.user._id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    if (report.status !== 'Resolved' || !report.citizenConfirmed) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm the resolved report before reviewing the technician.',
      });
    }

    const assignment = await Assignment.findOne({
      report: report._id,
      status: 'Completed',
    }).sort({ completedAt: -1 });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Completed technician assignment not found.',
      });
    }

    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      report: report._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this report.',
      });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      report: report._id,
      technician: assignment.technician,
      rating: Number(rating),
      comment: comment?.trim() || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Your review has been submitted successfully.',
      review,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 3. CITIZEN VIEWS THEIR SUBMITTED REVIEWS
// ========================================
export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      reviewer: req.user._id,
    })
      .populate('report', 'title category status')
      .populate({
        path: 'technician',
        select: 'employeeId specialization rating',
        populate: {
          path: 'user',
          select: 'name',
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};
