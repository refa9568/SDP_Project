require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../database/database');
const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(async () => {
  // Seed / fix default leave types
  try {
    const mongoose = require('mongoose');
    const LeaveType = mongoose.model('LeaveType');
    const defaults = [
      { type_name: 'Annual',       max_days: 60  },
      { type_name: 'Casual',       max_days: 10  },
      { type_name: 'Recreational', max_days: 15  },
      { type_name: 'Medical',      max_days: 30  }
    ];
    for (const lt of defaults) {
      await LeaveType.findOneAndUpdate(
        { type_name: lt.type_name },
        { $set: { max_days: lt.max_days } },
        { upsert: true, new: true }
      );
    }
    console.log('Leave types seeded/updated successfully');
  } catch (e) {
    console.error('Leave type seeding error:', e.message);
  }
});

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`ParadeOps Backend Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
