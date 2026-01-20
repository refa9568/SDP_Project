const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User schema (copied from models/User.js for standalone script)
const userSchema = new mongoose.Schema({
  service_number: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  rank: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['soldier', 'coy_comd', 'adjutant', 'bsm', 'commanding_officer']
  },
  company: {
    type: String,
    required: false
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  password_hash: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

const updateSoldiersCompany = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradeops_db');
    console.log('✓ Connected to MongoDB');

    // Update all soldiers to have company: 'Radio'
    const result = await User.updateMany(
      { role: 'soldier' },
      { $set: { company: 'Radio' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} soldiers with company: 'Radio'`);

  } catch (error) {
    console.error('❌ Error updating soldiers:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
};

// Run the script
updateSoldiersCompany();