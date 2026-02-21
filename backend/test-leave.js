const mongoose = require('mongoose');
const Leave = require('./src/models/Leave');

async function testLeaveSubmit() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradeops_db');
        console.log('Connected to MongoDB');

        // Simulate user
        const user = {
            user_id: '696f0b5789261d85dcaa1951', // Aziz Ahmed - Radio company soldier
            role: 'soldier'
        };

        const leaveData = {
            user_id: new mongoose.Types.ObjectId(user.user_id),
            leave_type_id: new mongoose.Types.ObjectId('696bcac19a7be26639bc57ad'),
            start_date: '2026-01-25',
            end_date: '2026-01-26',
            total_days: 2,
            reason: 'Test leave',
            contact_number: '1234567890',
            address_during_leave: 'Home'
        };

        const leave_id = await Leave.create(leaveData);
        console.log('Leave created successfully:', leave_id);

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testLeaveSubmit();