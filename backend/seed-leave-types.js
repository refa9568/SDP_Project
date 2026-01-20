const mongoose = require('mongoose');
require('dotenv').config();

// LeaveType schema (copied from models/Leave.js for standalone script)
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

const LeaveType = mongoose.model('LeaveType', leaveTypeSchema);

const seedLeaveTypes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradeops_db');
    console.log('✓ Connected to MongoDB');

    const leaveTypes = [
      { type_name: 'Annual', max_days: 30 },
      { type_name: 'Casual', max_days: 10 },
      { type_name: 'Medical', max_days: 20 },
      { type_name: 'Recreational', max_days: 15 }
    ];

    for (const type of leaveTypes) {
      const existing = await LeaveType.findOne({ type_name: type.type_name });
      if (!existing) {
        await LeaveType.create(type);
        console.log(`✓ Created leave type: ${type.type_name}`);
      } else {
        console.log(`- Leave type already exists: ${type.type_name}`);
      }
    }

    console.log('✅ Leave types seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding leave types:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
};

// Run the script
seedLeaveTypes();