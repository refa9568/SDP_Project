const jwt = require('jsonwebtoken');
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
        unit: user.unit
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Add to active sessions
    activeSessions.add(token);

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        service_number: user.service_number,
        name: user.name,
        rank: user.rank,
        role: user.role,
        unit: user.unit
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

module.exports = {
  login,
  logout,
  verifyToken
};
