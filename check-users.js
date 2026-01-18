const mongoose = require('./backend/node_modules/mongoose');
const User = require('./backend/src/models/User');

async function checkAllUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/paradeops_db');

    const users = await User.find({}).select('service_number name company role');
    console.log('All users in database:');
    users.forEach(u => console.log(`${u.service_number} - ${u.name} (${u.role}) - ${u.company}`));

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit();
}

checkAllUsers();