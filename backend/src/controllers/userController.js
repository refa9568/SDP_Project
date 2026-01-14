const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const user = req.user;

    // Only admins and adjutants can view all users
    if (!['adjutant', 'commanding_officer'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

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

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  getCurrentUser
};
