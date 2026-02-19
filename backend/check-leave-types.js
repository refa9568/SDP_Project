const mongoose = require('mongoose');
const Leave = require('./src/models/Leave');

async function checkLeaveTypes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradeops_db');
        console.log('Connected to MongoDB');

        const leaveTypes = await Leave.getLeaveTypes();
        console.log('Leave Types:');
        leaveTypes.forEach(type => {
            console.log(`ID: ${type._id}, Name: ${type.type_name}, Max Days: ${type.max_days}`);
        });

        if (leaveTypes.length === 0) {
            console.log('No leave types found. Inserting default ones...');
            const defaultTypes = [
                { type_name: 'Annual Leave', max_days: 30 },
                { type_name: 'Casual Leave', max_days: 10 },
                { type_name: 'Medical Leave', max_days: 15 },
                { type_name: 'Emergency Leave', max_days: 5 }
            ];

            const LeaveType = mongoose.model('LeaveType');
            for (const type of defaultTypes) {
                const newType = new LeaveType(type);
                await newType.save();
                console.log(`Inserted: ${type.type_name}`);
            }
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkLeaveTypes();