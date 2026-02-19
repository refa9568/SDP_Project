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
  company: {
    type: String,
    required: false
  },
  role: {
    type: String,
    required: true,
    enum: ['soldier', 'coy_comd', 'adjutant', 'bsm', 'commanding_officer']
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

    // Assign soldiers to different companies
    const soldiers = await User.find({ role: 'soldier' });
    const companies = ['BHQ', 'Radio', 'Operating', 'HQ', 'RR', 'BSC'];
    let companyIndex = 0;

    for (const soldier of soldiers) {
      const company = companies[companyIndex % companies.length];
      await User.updateOne({ _id: soldier._id }, { $set: { company: company } });
      companyIndex++;
    }

    console.log(`✅ Assigned ${soldiers.length} soldiers to companies: BHQ, Radio, Operating, HQ, RR, BSC`);

  } catch (error) {
    console.error('❌ Error updating soldiers:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
};

// Run the script
updateSoldiersCompany();