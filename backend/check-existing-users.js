const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  service_number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  rank: { type: String, required: true },
  company: { type: String, required: false },
  role: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  password_hash: { type: String, required: true }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function checkExistingUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradeops_db');

    const existingUsers = await User.find({}).select('service_number name rank email phone').limit(10);
    console.log('Sample existing users:');
    existingUsers.forEach(user => {
      console.log(`Service: ${user.service_number}, Name: ${user.name}, Rank: ${user.rank}, Email: ${user.email}, Phone: ${user.phone}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkExistingUsers();