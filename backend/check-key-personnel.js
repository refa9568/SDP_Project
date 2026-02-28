const mongoose = require('mongoose');
const User = require('./src/models/User');

async function check() {
  try {
    await mongoose.connect('mongodb://localhost:27017/paradeops_db');
    console.log('Checking key personnel:');
    const users = await User.find({ service_number: { $in: ['1111001', '1111002', '1111003', '1111004'] } });
    users.forEach(u => console.log(`${u.service_number}: ${u.name} (${u.role})`));
    process.exit(0);
  } catch(e) { 
    console.error(e); 
    process.exit(1);
  }
}
check();
