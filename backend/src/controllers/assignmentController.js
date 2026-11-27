
import Assignment from '../models/Assignment.js';
import Report from '../models/Report.js';
import Technician from '../models/Technician.js';

// ========================================
// 1. CREATE A TECHNICIAN ASSIGNMENT
// ========================================
export const createAssignment = async (req, res, next) => {
  try {
    const {
      reportId,
      technicianId,
      priority,
      instructions,
    } = req.body;

    if (!reportId || !technicianId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID and technician ID are required.',
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    if (report.status !== 'Verified') {
      return res.status(400).json({
        success: false,
        message: 'Only verified reports can be assigned.',
      });
    }

    const technician = await Technician.findById(technicianId)
      .populate('user', 'status');

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found.',
      });
    }

    if (
      technician.employmentStatus !== 'Active' ||
      technician.user?.status !== 'active'
    ) {
      return res.status(400).json({
        success: false,
        message: 'This technician is not eligible for assignments.',
      });
    }

    if (technician.availability !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'This technician is currently unavailable.',
      });
    }

    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];

    const selectedPriority = priority || report.priority || 'Medium';

    if (!validPriorities.includes(selectedPriority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment priority.',
      });
    }

    // Create the assignment.
    const assignment = await Assignment.create({
      report: report._id,
      technician: technician._id,
      assignedBy: req.user._id,
      priority: selectedPriority,
      instructions: instructions || '',
    });

    try {
      // Update the original report.
      report.status = 'Assigned';
      report.assignedTo = technician._id;
      report.priority = selectedPriority;

      await report.save();
    } catch (error) {
      // Remove assignment if report update fails.
      await Assignment.findByIdAndDelete(assignment._id);
      throw error;
    }

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('report', 'title category status location')
      .populate('technician', 'employeeId specialization availability')
      .populate('assignedBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Technician assigned successfully.',
      assignment: populatedAssignment,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// 2. GET ALL ASSIGNMENTS
// ========================================
export const getAllAssignments = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    const validStatuses = [
      'Assigned',
      'Accepted',
      'In Progress',
      'Completed',
      'Cancelled',
    ];

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

    if (req.query.technician) {
      filter.technician = req.query.technician;
    }

    if (req.query.report) {
      filter.report = req.query.report;
    }

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .populate('report', 'title category status location')
        .populate('technician', 'employeeId specialization availability')
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
// 3. GET ONE ASSIGNMENT
// ========================================
export const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('report')
      .populate({
        path: 'technician',
        populate: {
          path: 'user',
          select: 'name email phone',
        },
      })
      .populate('assignedBy', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.',
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
// 4. CANCEL AN ASSIGNMENT
// ========================================
export const cancelAssignment = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    if (!cancellationReason || !cancellationReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a cancellation reason.',
      });
    }

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.',
      });
    }

    if (
      ['Completed', 'Cancelled'].includes(assignment.status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'This assignment cannot be cancelled.',
      });
    }

    assignment.status = 'Cancelled';
    assignment.cancellationReason = cancellationReason.trim();

    await assignment.save();

    // Return the report to Verified only if it still
    // belongs to this assignment.
    await Report.findOneAndUpdate(
      {
        _id: assignment.report,
        assignedTo: assignment.technician,
        status: { $in: ['Assigned', 'In Progress'] },
      },
      {
        $set: { status: 'Verified' },
        $unset: { assignedTo: 1 },
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Assignment cancelled successfully.',
      assignment,
    });
  } catch (error) {
    next(error);
  }
};
