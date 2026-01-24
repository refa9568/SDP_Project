const express = require('express');
const cors = require('cors');
const connectDB = require('../database/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
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
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/equipment', equipmentRoutes);

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
const PORT_NUM = process.env.PORT || 5000;
const server = app.listen(PORT_NUM, '127.0.0.1', () => {
  console.log(`\n✓ ParadeOps Backend Server running on port ${PORT_NUM}`);
  console.log(`✓ Health check: http://localhost:${PORT_NUM}/health`);
  console.log(`✓ API Base: http://localhost:${PORT_NUM}\n`);
  console.log('Server ready for requests...\n');
});

server.on('error', (err) => {
  console.error('\n✗ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`✗ Port ${PORT_NUM} is already in use. Kill it with: taskkill /F /IM node.exe`);
  }
  console.error('\n');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('✗ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('✗ Unhandled Rejection:', reason);
  process.exit(1);
});

module.exports = app;
