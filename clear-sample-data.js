const mongoose = require('./backend/node_modules/mongoose');

// Clear sample data from MongoDB
async function clearSampleData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/paradeops_db');
    console.log('✅ Connected to MongoDB\n');

    // Clear users collection (keep only if you want admin users)
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    const deletedUsers = await User.deleteMany({});
    console.log(`🗑️  Cleared ${deletedUsers.deletedCount} users from database`);

    // Clear leaves collection
    const Leave = mongoose.model('Leave', new mongoose.Schema({}, { strict: false }), 'leaves');
    const deletedLeaves = await Leave.deleteMany({});
    console.log(`🗑️  Cleared ${deletedLeaves.deletedCount} leaves from database`);

    // Clear equipment collection
    const Equipment = mongoose.model('Equipment', new mongoose.Schema({}, { strict: false }), 'equipment');
    const deletedEquipment = await Equipment.deleteMany({});
    console.log(`🗑️  Cleared ${deletedEquipment.deletedCount} equipment from database`);

    // Keep leave types as they are needed for the system
    const LeaveType = mongoose.model('LeaveType', new mongoose.Schema({}, { strict: false }), 'leavetypes');
    const leaveTypeCount = await LeaveType.countDocuments({});
    console.log(`📋 Kept ${leaveTypeCount} leave types (needed for system)`);

    console.log('\n✅ All sample data cleared successfully!');
    console.log('📝 Now you can add fresh data using the forms:');
    console.log('   - User Registration: http://localhost:8081/user-registration.html');
    console.log('   - Equipment Registration: http://localhost:8081/equipment-registration.html');

  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

clearSampleData();