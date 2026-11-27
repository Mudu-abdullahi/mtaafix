
import Report from '../models/Report.js';
import User from '../models/User.js';
import Technician from '../models/Technician.js';
import SystemSetting from '../models/SystemSetting.js';

// ========================================
// 1. GET ALL COMMUNITY REPORTS
// ========================================
export const getAllReports = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.severity) filter.severity = req.query.severity;

    if (req.query.county) {
      filter['location.county'] = {
        $regex: req.query.county,
        $options: 'i',
      };
    }

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reportedBy', 'name email phone')
        .populate('assignedTo', 'specialization availability')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
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
// 2. GET A SINGLE REPORT
// ========================================
export const getAdminReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'specialization availability')
      .populate('verifiedBy', 'name email')
      .populate('votes', 'name');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
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
// 3. VERIFY A COMMUNITY REPORT
// ========================================
export const verifyReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    if (report.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'A rejected report cannot be verified.',
      });
    }

    if (
      ['Verified', 'Assigned', 'In Progress', 'Resolved'].includes(
        report.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'This report has already been verified.',
      });
    }

    report.status = 'Verified';
    report.verifiedBy = req.user._id;
    report.verifiedAt = new Date();

    await report.save();

    return res.status(200).json({
      success: true,
      message: 'Report verified successfully.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// 4. REJECT A COMMUNITY REPORT
// ========================================
export const rejectReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    if (report.status === 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'A resolved report cannot be rejected.',
      });
    }

    if (report.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'This report has already been rejected.',
      });
    }

    report.status = 'Rejected';
    report.verifiedBy = req.user._id;
    report.verifiedAt = new Date();

    await report.save();

    return res.status(200).json({
      success: true,
      message: 'Report rejected successfully.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// 5. UPDATE REPORT STATUS
// ========================================
export const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      'Pending',
      'Under Review',
      'Verified',
      'Assigned',
      'In Progress',
      'Resolved',
      'Rejected',
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid report status.',
        allowedStatuses,
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    if (report.status === 'Rejected' && status !== 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'A rejected report cannot be reopened through this endpoint.',
      });
    }

    if (status === 'Verified') {
      report.verifiedBy = req.user._id;
      report.verifiedAt = new Date();
    }

    report.status = status;

    await report.save();

    return res.status(200).json({
      success: true,
      message: 'Report status updated successfully.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// 6. GET ADMIN DASHBOARD STATISTICS
// ========================================
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalReports,
      pendingReports,
      underReviewReports,
      verifiedReports,
      assignedReports,
      inProgressReports,
      resolvedReports,
      rejectedReports,
      totalCitizens,
      totalTechnicians,
      activeTechnicians,
      recentReports,
      categoryStats,
      statusStats,
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'Pending' }),
      Report.countDocuments({ status: 'Under Review' }),
      Report.countDocuments({ status: 'Verified' }),
      Report.countDocuments({ status: 'Assigned' }),
      Report.countDocuments({ status: 'In Progress' }),
      Report.countDocuments({ status: 'Resolved' }),
      Report.countDocuments({ status: 'Rejected' }),

      User.countDocuments({ role: 'citizen' }),
      Technician.countDocuments(),
      Technician.countDocuments({ employmentStatus: 'Active' }),

      Report.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'specialization availability'),

      Report.aggregate([
        {
          $group: {
            _id: '$category',
            total: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),

      Report.aggregate([
        {
          $group: {
            _id: '$status',
            total: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully.',
      statistics: {
        reports: {
          total: totalReports,
          pending: pendingReports,
          underReview: underReviewReports,
          verified: verifiedReports,
          assigned: assignedReports,
          inProgress: inProgressReports,
          resolved: resolvedReports,
          rejected: rejectedReports,
        },
        users: {
          totalCitizens,
          totalTechnicians,
          activeTechnicians,
        },
        performance: {
          resolutionRate:
            totalReports > 0
              ? Number(((resolvedReports / totalReports) * 100).toFixed(2))
              : 0,
        },
        categoryBreakdown: categoryStats,
        statusBreakdown: statusStats,
      },
      recentReports,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// 7. GET ALL COMMUNITY USERS
// ========================================
export const getAllCommunityUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { role: 'citizen' };

    if (req.query.status) {
      const status = req.query.status.toLowerCase();

      if (!['active', 'suspended'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user status.',
        });
      }

      filter.status = status;
    }

    if (req.query.search?.trim()) {
      const search = req.query.search.trim();

      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email phone role status createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// 8. UPDATE COMMUNITY USER STATUS
// ========================================
export const updateCommunityUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active or suspended.',
      });
    }

    const user = await User.findOne({
      _id: req.params.id,
      role: 'citizen',
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Community user not found.',
      });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account ${
        status === 'active' ? 'reactivated' : 'suspended'
      } successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// 9. GET SYSTEM SETTINGS
// ========================================
export const getSystemSettings = async (req, res, next) => {
  try {
    let settings = await SystemSetting.findOne({ key: 'main' });

    if (!settings) {
      settings = await SystemSetting.create({ key: 'main' });
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// 10. UPDATE SYSTEM SETTINGS
// ========================================
export const updateSystemSettings = async (req, res, next) => {
  try {
    const {
      businessName,
      acceptingRequests,
      maintenanceMode,
      contactEmail,
      contactPhone,
      supportMessage,
    } = req.body;

    const updates = {};

    if (businessName !== undefined) {
      if (typeof businessName !== 'string' || !businessName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Business name cannot be empty.',
        });
      }

      updates.businessName = businessName.trim();
    }

    if (acceptingRequests !== undefined) {
      if (typeof acceptingRequests !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Accepting requests must be true or false.',
        });
      }

      updates.acceptingRequests = acceptingRequests;
    }

    if (maintenanceMode !== undefined) {
      if (typeof maintenanceMode !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Maintenance mode must be true or false.',
        });
      }

      updates.maintenanceMode = maintenanceMode;
    }

    if (contactEmail !== undefined) {
      if (
        typeof contactEmail !== 'string' ||
        (contactEmail.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim()))
      ) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid contact email.',
        });
      }

      updates.contactEmail = contactEmail.trim().toLowerCase();
    }

    if (contactPhone !== undefined) {
      if (typeof contactPhone !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Contact phone must be text.',
        });
      }

      updates.contactPhone = contactPhone.trim();
    }

    if (supportMessage !== undefined) {
      if (typeof supportMessage !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Support message must be text.',
        });
      }

      updates.supportMessage = supportMessage.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid settings were provided.',
      });
    }

    const settings = await SystemSetting.findOneAndUpdate(
      { key: 'main' },
      {
        $set: updates,
        $setOnInsert: { key: 'main' },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'System settings updated successfully.',
      settings,
    });
  } catch (error) {
    next(error);
  }
};
