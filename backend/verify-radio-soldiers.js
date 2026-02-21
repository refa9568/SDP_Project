const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ service_number: String, name: String, rank: String, company: String, role: String, email: String, phone: String });
const User = mongoose.model('User', userSchema);

async function verifySoldiers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradeops_db');

    const radioUsers = await User.find({ company: 'Radio' }).select('service_number name rank email phone').sort({ service_number: 1 });
    console.log('Radio company soldiers added:');
    console.log('Total Radio users:', radioUsers.length);

    const rankCounts = {};
    radioUsers.forEach(user => {
      rankCounts[user.rank] = (rankCounts[user.rank] || 0) + 1;
    });

    console.log('Rank distribution:');
    Object.entries(rankCounts).forEach(([rank, count]) => {
      console.log(`- ${rank}: ${count}`);
    });

    console.log('\nFirst 5 soldiers:');
    radioUsers.slice(0, 5).forEach(user => {
      console.log(`Service: ${user.service_number}, Name: ${user.name}, Rank: ${user.rank}, Email: ${user.email}, Phone: ${user.phone}`);
    });

    console.log('\nLast 5 soldiers:');
    radioUsers.slice(-5).forEach(user => {
      console.log(`Service: ${user.service_number}, Name: ${user.name}, Rank: ${user.rank}, Email: ${user.email}, Phone: ${user.phone}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifySoldiers();