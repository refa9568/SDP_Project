const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { JWT_SECRET } = require('../middleware/auth');

// Store active sessions (in production, use Redis)
const activeSessions = new Set();

const login = async (req, res) => {
  try {
    const { service_number, password } = req.body;

    if (!service_number || !password) {
      return res.status(400).json({ error: 'Service number and password are required' });
    }

    // Find user by service number
    const user = await User.findByServiceNumber(service_number);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isValidPassword = await User.validatePassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        service_number: user.service_number,
        name: user.name,
        rank: user.rank,
        role: user.role,
        company: user.company
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Add to active sessions
    activeSessions.add(token);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        service_number: user.service_number,
        name: user.name,
        rank: user.rank,
        role: user.role,
        company: user.company
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      activeSessions.delete(token);
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

const verifyToken = async (req, res) => {
  try {
    // Token is already verified by middleware
    res.json({
      valid: true,
      user: req.user
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
};

const register = async (req, res) => {
  try {
    const { service_number, name, rank, role, company, email, phone, password } = req.body;
    const requestingUser = req.user; // May be undefined if no token

    // Only check permissions if user is authenticated
    if (requestingUser && !['adjutant', 'commanding_officer'].includes(requestingUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Validate required fields
    if (!service_number || !name || !rank || !password) {
      return res.status(400).json({ error: 'Service number, name, rank, and password are required' });
    }

    // Determine role based on service number
    let userRole = role;
    const serviceNum = parseInt(service_number);
    if (!isNaN(serviceNum) && serviceNum >= 1111005) {
      userRole = 'soldier';
    } else if (!role) {
      return res.status(400).json({ error: 'Role is required for service numbers below 1111005' });
    }

    // Check if user already exists
    const existingUser = await User.findByServiceNumber(service_number);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this service number already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const userId = await User.createUser({
      service_number,
      name,
      rank,
      role: userRole,
      company: company || null,
      email: email || null,
      phone: phone || null,
      password_hash
    });

    // Auto-create blank attendance record for soldiers (for today's date)
    if (userRole === 'soldier') {
      try {
        const today = new Date().toISOString().split('T')[0];
        await Attendance.create({
          service_number,
          date: today,
          name,
          rank,
          company: company || '',
          morning_pt: '',
          office: '',
          games: '',
          roll_call: '',
          leave: '',
          awol: ''
        });
      } catch (attErr) {
        console.error('Auto-create attendance failed:', attErr.message);
        // Non-fatal: user still created successfully
      }
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user_id: userId
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Find the user to get the current password hash
    const dbUser = await User.findByServiceNumber(user.service_number);
    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate current password
    const isValidCurrentPassword = await User.validatePassword(currentPassword, dbUser.password_hash);
    if (!isValidCurrentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long, contain at least one uppercase letter, and one special character.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('Updating password for user:', user.service_number);

    // Update the user's password in the database
    const updatedUser = await User.updateUser(dbUser._id, { password_hash: hashedPassword });

    console.log('Password update result:', updatedUser);

    if (!updatedUser) {
      return res.status(400).json({ error: 'Password update failed' });
    }

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = {
  login,
  logout,
  verifyToken,
  register,
  changePassword
};
