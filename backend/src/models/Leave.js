const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
  type_name: {
    type: String,
    required: true,
    unique: true
  },
  max_days: {
    type: Number,
    required: true
  }
});

const leaveSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leave_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
    required: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  total_days: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  address_during_leave: {
    type: String
  },
  contact_number: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejection_reason: {
    type: String
  }
}, {
  timestamps: true
});

// Static methods
leaveSchema.statics.findAll = function(filters = {}) {
  let query = this.find();

  if (filters.user_id) {
    query = query.where('user_id').equals(filters.user_id);
  }

  if (filters.status) {
    query = query.where('status').equals(filters.status);
  }

  if (filters.unit) {
    // This requires population and filtering
    query = query.populate({
      path: 'user_id',
      match: { company: filters.unit }
    });
  }

  return query
    .populate('user_id', 'name service_number rank company role')
    .populate('leave_type_id', 'type_name max_days')
    .populate('approved_by', 'name')
    .sort({ createdAt: -1 });
};

leaveSchema.statics.findLeaveById = function(leave_id) {
  return this.findOne({ _id: leave_id })
    .populate('user_id', 'name service_number rank company')
    .populate('leave_type_id', 'type_name')
    .populate('approved_by', 'name');
};

leaveSchema.statics.create = function(leaveData) {
  const leave = new this(leaveData);
  return leave.save();
};

leaveSchema.statics.approve = function(leave_id, approved_by) {
  return this.findByIdAndUpdate(
    leave_id,
    {
      status: 'approved',
      approved_by: approved_by
    },
    { new: true }
  );
};

leaveSchema.statics.reject = function(leave_id, approved_by, rejection_reason = null) {
  return this.findByIdAndUpdate(
    leave_id,
    {
      status: 'rejected',
      approved_by: approved_by,
      rejection_reason: rejection_reason
    },
    { new: true }
  );
};

leaveSchema.statics.getLeaveTypes = function() {
  return this.model('LeaveType').find().sort('type_name');
};

leaveSchema.statics.getLeaveBalance = async function(user_id) {
  const leaveTypes = await this.model('LeaveType').find();

  // Safely convert to ObjectId
  let oid;
  try {
    oid = new mongoose.Types.ObjectId(user_id);
  } catch (e) {
    console.error('Invalid user_id for leave balance:', user_id);
    return leaveTypes.map(type => ({
      type_name: type.type_name,
      max_days: type.max_days,
      used_days: 0,
      remaining_days: type.max_days
    }));
  }

  const balances = await Promise.all(leaveTypes.map(async (type) => {
    const usedDays = await this.aggregate([
      {
        $match: {
          user_id: oid,
          leave_type_id: type._id,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total_days' }
        }
      }
    ]);

    const used = usedDays.length > 0 ? usedDays[0].total : 0;
    return {
      type_name: type.type_name,
      max_days: type.max_days,
      used_days: used,
      remaining_days: type.max_days - used
    };
  }));

  return balances;
};

leaveSchema.statics.delete = function(leave_id) {
  return this.findByIdAndDelete(leave_id);
};

const Leave = mongoose.model('Leave', leaveSchema);
const LeaveType = mongoose.model('LeaveType', leaveTypeSchema);

module.exports = Leave;
