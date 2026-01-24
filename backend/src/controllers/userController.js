const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const user = req.user;

    // Allow all authenticated users to view users for now
    const users = await User.getAllUsers();

    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Users can view their own profile, admins/adjutants can view any
    if (parseInt(id) !== currentUser.user_id && !['adjutant', 'commanding_officer'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const updates = req.body;

    // Only admins/adjutants can update users
    if (!['adjutant', 'commanding_officer'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Don't allow updating sensitive fields through this endpoint
    delete updates.password;
    delete updates.user_id;

    const success = await User.updateUser(id, updates);

    if (!success) {
      return res.status(404).json({ error: 'User not found or no changes made' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Get personal roster for a company (for coy_comd)
const getPersonalRoster = async (req, res) => {
  try {
    const currentUser = req.user;
    
    // Only coy_comd, adjutant, and commanding_officer can access roster
    const allowedRoles = ['coy_comd', 'adjutant', 'commanding_officer', 'bsm'];
    if (!allowedRoles.includes(currentUser.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get the company from query params or current user
    const company = req.query.company || currentUser.company;

    if (!company) {
      return res.status(400).json({ error: 'Company parameter is required' });
    }

    // Fetch all soldiers in the company
    const soldiers = await User.find({ 
      role: 'soldier', 
      company: company 
    }).sort({ service_number: 1 });

    // Fetch all leaves for processing
    const Leave = require('../models/Leave');
    const allLeaves = await Leave.find({}).populate('user_id');

    // Process soldier data with current status
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const processedSoldiers = soldiers.map(soldier => {
      let status = 'On Parade';
      let statusClass = 'status-present';

      // Check if soldier is on approved leave
      const activeLeave = allLeaves.find(leave => {
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        const leaveSolderId = leave.user_id._id ? leave.user_id._id.toString() : leave.user_id.toString();
        return leaveSolderId === soldier._id.toString() &&
               now >= start && now <= end && 
               leave.status === 'approved';
      });

      if (activeLeave) {
        status = 'On Leave';
        statusClass = 'status-leave';
      }

      return {
        service_number: soldier.service_number,
        name: soldier.name,
        rank: soldier.rank,
        company: soldier.company,
        status: status,
        statusClass: statusClass,
        activities: 'Unit Duty, Training Activities, Special Tasks' // Default activities
      };
    });

    // Calculate statistics
    const totalStrength = processedSoldiers.length;
    const onParade = processedSoldiers.filter(s => s.status === 'On Parade').length;
    const onLeave = processedSoldiers.filter(s => s.status === 'On Leave').length;

    res.json({
      company: company,
      roster: processedSoldiers,
      statistics: {
        totalStrength,
        onParade,
        onLeave,
        other: totalStrength - onParade - onLeave
      }
    });
  } catch (error) {
    console.error('Get personal roster error:', error);
    res.status(500).json({ error: 'Failed to fetch personal roster' });
  }
};

const getDailyEmployment = async (req, res) => {
  try {
    const currentUser = req.user;
    const { company } = req.query;

    // Verify access
    if (!['coy_comd', 'adjutant', 'commanding_officer', 'bsm'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!company) {
      return res.status(400).json({ error: 'Company parameter is required' });
    }

    // Get current date and month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    // Daily employment tasks (one month of data)
    const employmentTasks = [
      { date: '01', events: 'GOC Guard (01.01.26–31.01.26)', employment: '1×SWO, 2×WO, 3×Sgt, 4×Cpl, 8×L/Cpl' },
      { date: '02', events: 'GOC Guard (Contd)', employment: '1×SWO, 2×WO, 3×Sgt, 4×Cpl, 8×L/Cpl' },
      { date: '03', events: 'GOC Guard (Contd)', employment: '1×SWO, 2×WO, 3×Sgt, 4×Cpl, 8×L/Cpl' },
      { date: '04', events: 'Quarter Guard Duty', employment: '2×WO, 3×Sgt, 6×Cpl' },
      { date: '05', events: 'Training Ground Development', employment: '1×SWO, 1×WO, 2×Sgt' },
      { date: '06', events: 'Firing Practice', employment: '1×Sgt, 2×L/Cpl, 5×Snk' },
      { date: '07', events: 'Route March', employment: '2×WO, 3×Sgt, 8×L/Cpl, 15×Snk' },
      { date: '08', events: 'Admin Day', employment: '1×SWO, 2×WO, 4×Sgt, 10×Cpl' },
      { date: '09', events: 'GOC Guard (Contd)', employment: '1×SWO, 2×WO, 3×Sgt, 4×Cpl, 8×L/Cpl' },
      { date: '10', events: 'Training Ground Development', employment: '1×SWO, 1×WO, 2×Sgt' },
      { date: '11', events: 'Firing Practice', employment: '1×Sgt, 2×L/Cpl, 5×Snk' },
      { date: '12', events: 'Weapon Maintenance', employment: '1×WO, 3×Sgt, 6×Cpl, 12×L/Cpl' },
      { date: '13', events: 'Quarter Guard Duty', employment: '2×WO, 3×Sgt, 6×Cpl' },
      { date: '14', events: 'Training Conference', employment: '1×SWO, 2×WO' },
      { date: '15', events: 'Sports Day', employment: '1×SWO, 2×WO, 4×Sgt, 8×Cpl, 10×Snk' },
      { date: '16', events: 'Parade Practice', employment: '1×SWO, 2×WO, 3×Sgt, 4×Cpl, 8×L/Cpl, 20×Snk' },
      { date: '17', events: 'GOC Guard (Contd)', employment: '1×SWO, 2×WO, 3×Sgt, 4×Cpl, 8×L/Cpl' },
      { date: '18', events: 'Weapon Cleaning', employment: '1×WO, 2×Sgt, 5×Cpl, 10×Snk' },
      { date: '19', events: 'Route Reconnoitring', employment: '1×SWO, 1×WO, 2×Sgt, 5×L/Cpl' },
      { date: '20', events: 'Firing Range', employment: '2×Sgt, 3×L/Cpl, 8×Snk' },
      { date: '21', events: 'Admin Day', employment: '1×SWO, 2×WO, 4×Sgt, 10×Cpl' },
      { date: '22', events: 'Quarter Guard Duty', employment: '2×WO, 3×Sgt, 6×Cpl' },
      { date: '23', events: 'Training Continuation', employment: '1×SWO, 1×WO, 3×Sgt, 5×L/Cpl, 10×Snk' },
      { date: '24', events: 'Parade Practice', employment: '1×SWO, 2×WO, 3×Sgt, 4×Cpl, 8×L/Cpl, 20×Snk' },
      { date: '25', events: 'GOC Guard (Contd)', employment: '1×SWO, 2×WO, 3×Sgt, 4×Cpl, 8×L/Cpl' },
      { date: '26', events: 'Weapon Maintenance', employment: '1×WO, 3×Sgt, 6×Cpl, 12×L/Cpl' },
      { date: '27', events: 'Route March', employment: '2×WO, 3×Sgt, 8×L/Cpl, 15×Snk' },
      { date: '28', events: 'Sports Activity', employment: '1×SWO, 2×WO, 4×Sgt, 8×Cpl, 10×Snk' },
      { date: '29', events: 'Training Continuation', employment: '1×SWO, 1×WO, 3×Sgt, 5×L/Cpl, 10×Snk' },
      { date: '30', events: 'Admin Day', employment: '1×SWO, 2×WO, 4×Sgt, 10×Cpl' },
      { date: '31', events: 'Month End Consolidation', employment: '1×SWO, 2×WO, 3×Sgt, 4×Cpl, 8×L/Cpl' }
    ];

    // Get soldiers for rank-wise state
    const soldiers = await User.find({ 
      role: 'soldier', 
      company: company 
    });

    const Leave = require('../models/Leave');
    const allLeaves = await Leave.find({}).populate('user_id');

    // Group soldiers by rank and get those not on leave
    const rankGroups = {};
    soldiers.forEach(soldier => {
      // Check if on leave
      const onLeave = allLeaves.some(leave => {
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        const leaveSolderId = leave.user_id._id ? leave.user_id._id.toString() : leave.user_id.toString();
        return leaveSolderId === soldier._id.toString() && 
               now >= start && now <= end && 
               leave.status === 'approved';
      });

      if (!onLeave) { // Only count those not on leave
        if (!rankGroups[soldier.rank]) {
          rankGroups[soldier.rank] = [];
        }
        rankGroups[soldier.rank].push({
          service_number: soldier.service_number,
          name: soldier.name,
          status: 'Available'
        });
      }
    });

    res.json({
      company: company,
      month: `${month}/${year}`,
      daily_employment: employmentTasks,
      rank_wise_state: rankGroups
    });
  } catch (error) {
    console.error('Get daily employment error:', error);
    res.status(500).json({ error: 'Failed to fetch daily employment' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  getCurrentUser,
  getPersonalRoster,
  getDailyEmployment
};
