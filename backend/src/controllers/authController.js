const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
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
    const requestingUser = req.user;

    // Only admins/adjutants can register new users
    if (!['adjutant', 'commanding_officer'].includes(requestingUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Validate required fields
    if (!service_number || !name || !rank || !role || !password) {
      return res.status(400).json({ error: 'All required fields must be provided' });
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
      role,
      company: company || null,
      email: email || null,
      phone: phone || null,
      password_hash
    });

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

module.exports = {
  login,
  logout,
  verifyToken,
  register
};
