
import Technician from '../models/Technician.js';
import Assignment from '../models/Assignment.js';
import Report from '../models/Report.js';

// ========================================
// HELPER: GET LOGGED-IN TECHNICIAN
// ========================================
const getLoggedInTechnician = async (userId) => {
  return Technician.findOne({ user: userId });
};


// ========================================
// 1. GET MY ASSIGNED JOBS
// ========================================
export const getMyJobs = async (req, res, next) => {
  try {
    const technician = await getLoggedInTechnician(req.user._id);

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found.',
      });
    }

    const validStatuses = [
      'Assigned',
      'Accepted',
      'In Progress',
      'Completed',
      'Cancelled',
    ];

    const filter = {
      technician: technician._id,
    };

    if (req.query.status) {
      if (!validStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assignment status.',
          validStatuses,
        });
      }

      filter.status = req.query.status;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .populate('report')
        .populate('assignedBy', 'name email')
        .sort({ assignedAt: -1 })
        .skip(skip)
        .limit(limit),

      Assignment.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: assignments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      assignments,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 2. GET MY JOB DETAILS
// ========================================
export const getMyJobById = async (req, res, next) => {
  try {
    const technician = await getLoggedInTechnician(req.user._id);

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found.',
      });
    }

    const assignment = await Assignment.findOne({
      _id: req.params.id,
      technician: technician._id,
    })
      .populate('report')
      .populate('assignedBy', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you are not authorized to access it.',
      });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 3. ACCEPT ASSIGNMENT
// ========================================
export const acceptJob = async (req, res, next) => {
  try {
    const technician = await getLoggedInTechnician(req.user._id);

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found.',
      });
    }

    if (
      technician.employmentStatus !== 'Active' ||
      technician.availability === 'Unavailable'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Your technician account is not available for this job.',
      });
    }

    const assignment = await Assignment.findOne({
      _id: req.params.id,
      technician: technician._id,
      status: 'Assigned',
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Pending assignment not found.',
      });
    }

    assignment.status = 'Accepted';
    assignment.acceptedAt = new Date();

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: 'Job accepted successfully.',
      assignment,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 4. START JOB
// ========================================
export const startJob = async (req, res, next) => {
  try {
    const technician = await getLoggedInTechnician(req.user._id);

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found.',
      });
    }

    if (technician.employmentStatus !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Your technician account is not active.',
      });
    }

    const assignment = await Assignment.findOne({
      _id: req.params.id,
      technician: technician._id,
      status: 'Accepted',
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Accepted assignment not found.',
      });
    }

    assignment.status = 'In Progress';
    assignment.startedAt = new Date();

    await assignment.save();

    await Technician.findByIdAndUpdate(technician._id, {
      availability: 'Busy',
    });

    await Report.findByIdAndUpdate(assignment.report, {
      status: 'In Progress',
    });

    return res.status(200).json({
      success: true,
      message: 'Job started successfully.',
      assignment,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 5. COMPLETE JOB
// ========================================
export const completeJob = async (req, res, next) => {
  try {
    const technician = await getLoggedInTechnician(req.user._id);

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found.',
      });
    }

    const { completionNotes, evidence } = req.body;

    if (!completionNotes || !completionNotes.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide job completion notes.',
      });
    }

    if (
      evidence !== undefined &&
      (!Array.isArray(evidence) ||
        evidence.some(
          (item) =>
            !item ||
            typeof item.url !== 'string' ||
            !item.url.trim()
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Evidence must be an array of objects containing valid URLs.',
      });
    }

    const assignment = await Assignment.findOne({
      _id: req.params.id,
      technician: technician._id,
      status: 'In Progress',
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Active job not found.',
      });
    }

    const report = await Report.findById(assignment.report);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'The report linked to this job was not found.',
      });
    }

    assignment.status = 'Completed';
    assignment.completedAt = new Date();
    assignment.completionNotes = completionNotes.trim();

    if (evidence !== undefined) {
      assignment.evidence = evidence.map((item) => ({
        url: item.url.trim(),
        publicId: item.publicId || '',
      }));
    }

    await assignment.save();

    // Update the original citizen report.
    report.status = 'Resolved';
    report.citizenConfirmed = false;
    report.resolution = {
      description: completionNotes.trim(),
      evidence: assignment.evidence.map((item) => ({
        url: item.url,
        publicId: item.publicId,
      })),
      resolvedAt: new Date(),
    };

    await report.save();

    // Update technician statistics and availability.
    await Technician.findByIdAndUpdate(technician._id, {
      $inc: { completedJobs: 1 },
      $set: { availability: 'Available' },
    });

    return res.status(200).json({
      success: true,
      message: 'Job completed successfully. The report is awaiting citizen confirmation.',
      assignment,
      report,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 6. UPDATE TECHNICIAN AVAILABILITY
// ========================================
export const updateMyAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;

    const validAvailability = [
      'Available',
      'Unavailable',
    ];

    if (!validAvailability.includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Availability must be Available or Unavailable.',
      });
    }

    const technician = await getLoggedInTechnician(req.user._id);

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found.',
      });
    }

    if (
      technician.employmentStatus !== 'Active' ||
      technician.availability === 'Busy'
    ) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change availability while inactive or working on a job.',
      });
    }

    technician.availability = availability;
    await technician.save();

    return res.status(200).json({
      success: true,
      message: 'Your availability has been updated.',
      availability: technician.availability,
    });
  } catch (error) {
    next(error);
  }
};
