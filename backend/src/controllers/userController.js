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

    const user = await User.findUserById(id);

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
    const user = await User.findUserById(req.user.user_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

const getRankSummary = async (req, res) => {
  try {
    // Get all users (no auth required for this endpoint)
    const users = await User.getAllUsers();

    // Filter for Radio company only
    const radioUsers = users.filter(user => user.company === 'Radio');

    // Get all active leaves to exclude users on leave
    const Leave = require('../models/Leave');
    const activeLeaves = await Leave.findAll({ status: 'approved' });

    // Create a set of user IDs on leave
    const usersOnLeave = new Set(activeLeaves.map(leave => leave.user_id.toString()));

    // Rank normalization mapping
    const rankNormalization = {
      'Cpl': 'Corporal',
      'Sgt': 'Sergeant',
      'L/Cpl': 'Lance Corporal',
      'Snk': 'Soldier',
      'WO': 'WO',
      'SWO': 'SWO',
      'Subedar': 'Subedar',
      'Corporal': 'Corporal',
      'Sergeant': 'Sergeant',
      'Lance Corporal': 'Lance Corporal',
      'Soldier': 'Soldier',
      'Lieutenant': 'Lieutenant',
      'Captain': 'Captain',
      'Major': 'Major',
      'Colonel': 'Colonel'
    };

    // Group users by normalized rank, excluding those on leave
    const rankCounts = {};
    const rankDetails = {};

    radioUsers.forEach(user => {
      if (!usersOnLeave.has(user._id.toString())) {
        const rawRank = user.rank || 'Unknown';
        const normalizedRank = rankNormalization[rawRank] || rawRank;

        if (!rankCounts[normalizedRank]) {
          rankCounts[normalizedRank] = 0;
          rankDetails[normalizedRank] = [];
        }

        rankCounts[normalizedRank]++;
        rankDetails[normalizedRank].push({
          id: user._id,
          service_number: user.service_number,
          name: user.name,
          status: 'Available'
        });
      }
    });
    
    res.json({
      rankCounts,
      rankDetails
    });
  } catch (error) {
    console.error('Get rank summary error:', error);
    res.status(500).json({ error: 'Failed to fetch rank summary' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  getCurrentUser,
  getRankSummary
};
