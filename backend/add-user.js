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
    required: true
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

const addUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradeops_db');
    console.log('✓ Connected to MongoDB');

    // User data - modify these values as needed
    const userData = {
      service_number: 'BSM-001', // Change this
      name: 'Battalion Sergeant Major', // Change this
      rank: 'Warrant Officer', // Change this
      role: 'bsm', // Change this
      company: 'BHQ', // Change this
      email: 'bsm@example.com', // Optional
      phone: '1234567890', // Optional
      password_hash: await bcrypt.hash('password123', 10) // Default password
    };

    // Check if user already exists
    const existingUser = await User.findOne({ service_number: userData.service_number });
    if (existingUser) {
      console.log('❌ User with this service number already exists');
      return;
    }

    // Create user
    const newUser = new User(userData);
    await newUser.save();

    console.log('✅ User added successfully!');
    console.log('Service Number:', userData.service_number);
    console.log('Name:', userData.name);
    console.log('Role:', userData.role);

  } catch (error) {
    console.error('❌ Error adding user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
};

// Run the script
addUser();