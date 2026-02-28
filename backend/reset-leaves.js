const mongoose = require('mongoose');
require('dotenv').config();
const Leave = require('./src/models/Leave');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradeops_db');
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const resetLeaves = async () => {
  try {
    
    // Delete all leaves
    const result = await Leave.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} leave records`);
    
    console.log('\n✓ All leaves have been reset!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error resetting leaves:', error.message);
    process.exit(1);
  }
};

connectDB().then(() => {
  resetLeaves();
});
