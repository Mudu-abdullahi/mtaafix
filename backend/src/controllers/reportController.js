
import Report from '../models/Report.js';
import Notification from '../models/Notification.js';

// ========================================
// 1. CREATE A COMMUNITY REPORT
// ========================================
export const createReport = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      image,
      location,
      severity,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !location?.address) {
      return res.status(400).json({
        success: false,
        message:
          'Title, description, category and location address are required.',
      });
    }

    // Create report in MongoDB
    const report = await Report.create({
      reportedBy: req.user._id,
      title,
      description,
      category,
      image: image || {},
      location,
      severity: severity || 'Medium',
      status: 'Pending',
    });

    // Automatically create notification for the citizen
    try {
      await Notification.create({
        recipient: req.user._id,
        title: 'Report received successfully',
        message: `Your ${category.toLowerCase()} report has been submitted successfully and is awaiting verification.`,
        type: 'Report Submitted',
        report: report._id,
        isRead: false,
      });
    } catch (notificationError) {
      // Keep the report even if notification creation fails
      console.error(
        'Notification creation failed:',
        notificationError.message
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Community report submitted successfully.',
      report,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 2. GET REPORTS BELONGING TO THE CITIZEN
// ========================================
export const getMyReports = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(req.query.limit) || 10)
    );

    const skip = (page - 1) * limit;

    const filter = {
      reportedBy: req.user._id,
    };

    // Optional status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'specialization availability'),

      Report.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: reports.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      reports,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 3. GET ONE REPORT BY ID
// ========================================
export const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'specialization availability');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    // Citizens can only view their own reports.
    // Admins and technicians can access reports through authorized routes.
    if (
      req.user.role === 'citizen' &&
      report.reportedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to view this report.',
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 4. UPDATE A CITIZEN'S OWN REPORT
// ========================================
export const updateMyReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    // Check report ownership
    if (
      report.reportedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reports.',
      });
    }

    // Only pending reports can be edited
    if (report.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending reports can be edited.',
      });
    }

    // Fields citizens are allowed to update
    const allowedFields = [
      'title',
      'description',
      'category',
      'image',
      'location',
      'severity',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        report[field] = req.body[field];
      }
    });

    const updatedReport = await report.save();

    return res.status(200).json({
      success: true,
      message: 'Report updated successfully.',
      report: updatedReport,
    });
  } catch (error) {
    next(error);
  }
};
