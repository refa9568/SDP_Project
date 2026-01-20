const mongoose = require('mongoose');
const User = require('./src/models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradeops_db');
        console.log('Connected to MongoDB');

        const soldiers = await User.find({}).sort({ service_number: 1 }).limit(15);
        console.log('Soldiers in database:');
        soldiers.forEach(u => {
            console.log(`${u.service_number} - ${u.name} (${u.rank}) - Role: ${u.role} - Password hash: ${u.password_hash ? 'exists' : 'missing'}`);
        });

        if (soldiers.length > 0) {
            const firstSoldier = soldiers[0];
            if (firstSoldier.password_hash) {
                const isValid = await User.validatePassword('A#1234', firstSoldier.password_hash);
                console.log(`\nPassword check for ${firstSoldier.service_number}: 'A#1234' is ${isValid ? 'valid' : 'invalid'}`);
            } else {
                console.log(`\nNo password set for ${firstSoldier.service_number}. Need to set a password.`);
            }
        }

        if (soldiers.length === 0) {
            console.log('No soldiers found. You may need to add users to the database first.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

check();
