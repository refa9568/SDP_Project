const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradeops_db');
        console.log('Connected to MongoDB');

        const hash = await bcrypt.hash('Test@123', 10);

        // Create a test coy_comd user
        const testUser = new User({
            service_number: 'CO001',
            name: 'Test Coy Commander',
            rank: 'Major',
            role: 'coy_comd',
            company: 'Radio',
            password_hash: hash
        });

        await testUser.save();
        console.log('✓ Created test coy_comd user: CO001 / Test@123');

        // Also create a commanding_officer
        const testCO = new User({
            service_number: 'CO002',
            name: 'Test Commanding Officer',
            rank: 'Colonel',
            role: 'commanding_officer',
            company: 'Radio',
            password_hash: hash
        });

        await testCO.save();
        console.log('✓ Created test commanding_officer user: CO002 / Test@123');

        // Create an adjutant
        const testAdj = new User({
            service_number: 'ADJ001',
            name: 'Test Adjutant',
            rank: 'Captain',
            role: 'adjutant',
            company: 'Radio',
            password_hash: hash
        });

        await testAdj.save();
        console.log('✓ Created test adjutant user: ADJ001 / Test@123');

        // Create a BSM
        const testBSM = new User({
            service_number: 'BSM001',
            name: 'Test BSM',
            rank: 'Subedar',
            role: 'bsm',
            company: 'Radio',
            password_hash: hash
        });

        await testBSM.save();
        console.log('✓ Created test bsm user: BSM001 / Test@123');

        console.log('\nTest Credentials:');
        console.log('================');
        console.log('Coy Commander: CO001 / Test@123');
        console.log('Commanding Officer: CO002 / Test@123');
        console.log('Adjutant: ADJ001 / Test@123');
        console.log('BSM: BSM001 / Test@123');
        console.log('Soldier: 2000001 / A#1234');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestUser();
