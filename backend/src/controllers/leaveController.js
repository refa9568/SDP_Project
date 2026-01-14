const Leave = require('../models/Leave');

const getAllLeaves = async (req, res) => {
  try {
    const { status, unit } = req.query;
    const user = req.user;

    let filters = {};

    // Role-based filtering
    if (user.role === 'soldier') {
      // Soldiers see only their own leaves
      filters.user_id = user.user_id;
    } else if (user.role === 'coy_comd') {
      // Company Commander sees leaves from their unit
      filters.unit = user.unit;
    }
    // adjutant, bsm, commanding_officer see all leaves

    // Apply status filter if provided
    if (status) {
      filters.status = status;
    }

    // Apply unit filter if provided (for CO/adjutant viewing specific units)
    if (unit && (user.role === 'adjutant' || user.role === 'commanding_officer' || user.role === 'bsm')) {
      filters.unit = unit;
    }

    const leaves = await Leave.findAll(filters);

    res.json({
      count: leaves.length,
      leaves
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ error: 'Failed to fetch leaves' });
  }
};

const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    // Check permissions
    if (user.role === 'soldier' && leave.user_id !== user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (user.role === 'coy_comd' && leave.unit !== user.unit) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(leave);
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({ error: 'Failed to fetch leave' });
  }
};

const createLeave = async (req, res) => {
  try {
    const { leave_type_id, start_date, end_date, days, reason } = req.body;
    const user = req.user;

    if (!leave_type_id || !start_date || !end_date || !days || !reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const leaveData = {
      user_id: user.user_id,
      leave_type_id,
      start_date,
      end_date,
      days,
      reason
    };

    const leave_id = await Leave.create(leaveData);

    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave_id
    });
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({ error: 'Failed to create leave application' });
  }
};

const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Check if user has permission to approve
    if (!['adjutant', 'coy_comd', 'bsm', 'commanding_officer'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to approve leaves' });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: `Leave is already ${leave.status}` });
    }

    // Company Commander can only approve leaves from their unit
    if (user.role === 'coy_comd' && leave.unit !== user.unit) {
      return res.status(403).json({ error: 'Can only approve leaves from your unit' });
    }

    const success = await Leave.approve(id, user.user_id);

    if (!success) {
      return res.status(400).json({ error: 'Failed to approve leave' });
    }

    res.json({ message: 'Leave approved successfully' });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ error: 'Failed to approve leave' });
  }
};

const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const user = req.user;

    // Check if user has permission to reject
    if (!['adjutant', 'coy_comd', 'bsm', 'commanding_officer'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to reject leaves' });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: `Leave is already ${leave.status}` });
    }

    // Company Commander can only reject leaves from their unit
    if (user.role === 'coy_comd' && leave.unit !== user.unit) {
      return res.status(403).json({ error: 'Can only reject leaves from your unit' });
    }

    const success = await Leave.reject(id, user.user_id, rejection_reason);

    if (!success) {
      return res.status(400).json({ error: 'Failed to reject leave' });
    }

    res.json({ message: 'Leave rejected successfully' });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ error: 'Failed to reject leave' });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    // Only the leave owner can delete their own pending leaves
    if (leave.user_id !== user.user_id && user.role !== 'adjutant') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Can only delete pending leaves' });
    }

    const success = await Leave.delete(id);

    if (!success) {
      return res.status(400).json({ error: 'Failed to delete leave' });
    }

    res.json({ message: 'Leave deleted successfully' });
  } catch (error) {
    console.error('Delete leave error:', error);
    res.status(500).json({ error: 'Failed to delete leave' });
  }
};

const getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await Leave.getLeaveTypes();
    res.json({ leaveTypes });
  } catch (error) {
    console.error('Get leave types error:', error);
    res.status(500).json({ error: 'Failed to fetch leave types' });
  }
};

const getLeaveBalance = async (req, res) => {
  try {
    const user_id = req.params.userId || req.user.user_id;

    // Only allow users to see their own balance unless they're admin/adjutant
    if (user_id !== req.user.user_id && !['adjutant', 'commanding_officer'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const balance = await Leave.getLeaveBalance(user_id);
    res.json({ balance });
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ error: 'Failed to fetch leave balance' });
  }
};

module.exports = {
  getAllLeaves,
  getLeaveById,
  createLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
  getLeaveTypes,
  getLeaveBalance
};
