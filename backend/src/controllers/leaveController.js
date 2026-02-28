const mongoose = require('mongoose');
const Leave = require('../models/Leave');

const getAllLeaves = async (req, res) => {
  try {
    const { status, company } = req.query;
    const user = req.user;

    let filters = {};

    // Role-based filtering
    if (user.role === 'soldier') {
      // Soldiers see only their own leaves
      if (mongoose.Types.ObjectId.isValid(user.user_id)) {
        filters.user_id = new mongoose.Types.ObjectId(user.user_id);
      } else {
        // Can't identify user — return empty safely
        return res.json({ count: 0, leaves: [] });
      }
    } else if (user.role === 'coy_comd') {
      // Company Commander sees only Radio company leaves
      filters.unit = 'Radio';
    } else if (user.role === 'adjutant') {
      // Adjutant sees all leaves except Radio company
      filters.exclude_unit = 'Radio';
    }
    // adjutant, bsm, commanding_officer see all leaves

    // Apply status filter if provided
    if (status) {
      filters.status = status;
    }

    // Apply company filter if provided (for CO/adjutant viewing specific companies)
    if (company && (user.role === 'adjutant' || user.role === 'commanding_officer' || user.role === 'bsm')) {
      filters.unit = company;
    }

    const leaves = await Leave.findAll(filters);

    // Flatten populated fields so frontend can access name, service_number etc. directly
    const formatted = leaves.map(l => {
      const obj = l.toObject ? l.toObject() : l;
      const user = obj.user_id || {};
      const leaveType = obj.leave_type_id || {};
      return {
        leave_id:             obj._id.toString(),
        user_id:              user._id || user,
        name:                 user.name            || 'Unknown',
        service_number:       user.service_number  || 'N/A',
        rank:                 user.rank            || '',
        company:              user.company         || 'N/A',
        type_name:            leaveType.type_name  || obj.leave_type || 'N/A',
        days:                 obj.total_days,
        start_date:           obj.start_date,
        end_date:             obj.end_date,
        reason:               obj.reason,
        contact_number:       obj.contact_number,
        address_during_leave: obj.address_during_leave,
        status:               obj.status,
        rejection_reason:     obj.rejection_reason,
        created_at:           obj.createdAt,
        approved_by:          obj.approved_by ? (obj.approved_by.name || obj.approved_by) : null
      };
    });

    res.json({
      count: formatted.length,
      leaves: formatted
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

    const leave = await Leave.findLeaveById(id);

    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    // Check permissions
    if (user.role === 'soldier' && String(leave.user_id?._id) !== String(user.user_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (user.role === 'coy_comd' && leave.user_id?.company !== user.company) {
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
    const { leave_type, start_date, end_date, days, reason, contact_number, address_during_leave } = req.body;
    const user = req.user;

    console.log('User ID:', user.user_id);
    console.log('Leave type:', leave_type);

    if (!leave_type || !start_date || !end_date || !days || !reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(user.user_id)) {
      return res.status(401).json({ error: 'Invalid session. Please log out and log back in.' });
    }

    // Find the leave type by name
    const LeaveType = mongoose.model('LeaveType');
    const leaveTypeDoc = await LeaveType.findOne({ type_name: leave_type });
    if (!leaveTypeDoc) {
      return res.status(400).json({ error: 'Invalid leave type' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const totalDays = parseInt(days);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before or equal to end date' });
    }

    if (totalDays <= 0) {
      return res.status(400).json({ error: 'Number of days must be positive' });
    }

    const leaveData = {
      user_id: new mongoose.Types.ObjectId(user.user_id),
      leave_type_id: leaveTypeDoc._id,
      start_date: start,
      end_date: end,
      total_days: totalDays,
      reason,
      contact_number: contact_number || null,
      address_during_leave: address_during_leave || null
    };

    console.log('Creating leave with data:', leaveData);

    const leave_id = await Leave.create(leaveData);

    res.status(201).json({
      success: true,
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

    console.log(`[approveLeave] user.role = "${user.role}", leave id = ${id}`);

    // Validate leave ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid leave ID format' });
    }

    // Check if user has permission to approve
    const allowedRoles = ['adjutant', 'coy_comd', 'bsm', 'commanding_officer'];
    if (!allowedRoles.includes((user.role || '').toLowerCase())) {
      return res.status(403).json({ error: `Insufficient permissions (role: ${user.role})` });
    }

    const leave = await Leave.findLeaveById(id);

    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: `This leave is already ${leave.status}` });
    }

    // Company Commander can only approve leaves from their unit
    if (user.role === 'coy_comd' && leave.user_id?.company !== user.company) {
      return res.status(403).json({ error: 'Can only approve leaves from your unit' });
    }

    // Safe approved_by: use valid ObjectId string, or null if missing
    const approvedBy = mongoose.Types.ObjectId.isValid(user.user_id) ? user.user_id : null;

    await mongoose.model('Leave').findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      { $set: { status: 'approved', ...(approvedBy ? { approved_by: approvedBy } : {}) } },
      { new: true, runValidators: false }
    );

    res.json({ message: 'Leave approved successfully' });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ error: error.message || 'Failed to approve leave' });
  }
};

const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const user = req.user;

    console.log(`[rejectLeave] user.role = "${user.role}", leave id = ${id}`);

    // Validate leave ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid leave ID format' });
    }

    // Check if user has permission to reject
    const allowedRoles = ['adjutant', 'coy_comd', 'bsm', 'commanding_officer'];
    if (!allowedRoles.includes((user.role || '').toLowerCase())) {
      return res.status(403).json({ error: `Insufficient permissions (role: ${user.role})` });
    }

    const leave = await Leave.findLeaveById(id);

    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: `This leave is already ${leave.status}` });
    }

    // Company Commander can only reject leaves from their unit
    if (user.role === 'coy_comd' && leave.user_id?.company !== user.company) {
      return res.status(403).json({ error: 'Can only reject leaves from your unit' });
    }

    // Safe approved_by: use valid ObjectId string, or null if missing
    const approvedBy = mongoose.Types.ObjectId.isValid(user.user_id) ? user.user_id : null;

    await mongoose.model('Leave').findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      { $set: { status: 'rejected', rejection_reason: rejection_reason || '', ...(approvedBy ? { approved_by: approvedBy } : {}) } },
      { new: true, runValidators: false }
    );

    res.json({ message: 'Leave rejected successfully' });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ error: error.message || 'Failed to reject leave' });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const leave = await Leave.findLeaveById(id);

    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    // Only the leave owner can delete their own pending leaves
    if (String(leave.user_id?._id) !== String(user.user_id) && user.role !== 'adjutant') {
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

const clearAllLeaves = async (req, res) => {
  try {
    const user = req.user;
    const allowedRoles = ['adjutant', 'commanding_officer', 'coy_comd'];
    if (!allowedRoles.includes((user.role || '').toLowerCase())) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const Leave = mongoose.model('Leave');
    const result = await Leave.deleteMany({});
    res.json({ message: `Cleared ${result.deletedCount} leave record(s) successfully` });
  } catch (error) {
    console.error('Clear all leaves error:', error);
    res.status(500).json({ error: 'Failed to clear leave history' });
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
  clearAllLeaves,
  getLeaveTypes,
  getLeaveBalance
};
