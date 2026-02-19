const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const ranks = ['SWO', 'WO', 'Sgt', 'Cpl', 'L/Cpl', 'Snk'];
const rankCounts = {
  'SWO': 1,
  'WO': 2,
  'Sgt': 3,
  'Cpl': 4,
  'L/Cpl': 8,
  'Snk': 30
};

async function createRadioCompany() {
  try {
    await mongoose.connect('mongodb://localhost:27017/paradeops_db');
    console.log('Connected to MongoDB');

    // Delete existing Radio company soldiers
    await User.deleteMany({
      role: 'soldier',
      company: 'Radio'
    });
    console.log('✓ Cleared existing Radio company soldiers');

    // Bengali Muslim names
    const bengaliFirstNames = [
      'Muhammad', 'Ahmed', 'Hassan', 'Ibrahim', 'Rashid', 'Karim', 'Nasir', 'Farhan', 'Faisal', 'Ali',
      'Omar', 'Samir', 'Jamal', 'Kamal', 'Hasan', 'Rahim', 'Azim', 'Azhar', 'Bashir', 'Daud',
      'Iqbal', 'Jabbar', 'Khalil', 'Latif', 'Malik', 'Noor', 'Qadir', 'Rahman', 'Salim', 'Tariq',
      'Usman', 'Wahab', 'Yousuf', 'Zaman', 'Amir', 'Anwar', 'Asad', 'Ayub', 'Aziz', 'Bari',
      'Dawood', 'Fahim', 'Gafar', 'Habib', 'Hakim', 'Hafiz', 'Hamid', 'Hanif', 'Haroon', 'Hasib'
    ];

    const bengaliLastNames = [
      'Khan', 'Ahmed', 'Hassan', 'Ali', 'Omar', 'Ibrahim', 'Malik', 'Saeed', 'Hussain', 'Mohammad',
      'Siddiqui', 'Hoque', 'Molla', 'Mandal', 'Chowdhury', 'Sheikh', 'Mirza', 'Bhuiyan', 'Alam', 'Reza',
      'Hasan', 'Karim', 'Nasir', 'Qureshi', 'Farooque', 'Ansari', 'Shaikh', 'Farooq', 'Azim', 'Azhar'
    ];

    const hash = await bcrypt.hash('A#1234', 10);
    const soldiers = [];
    let serviceNoCounter = 2000001;

    // Generate soldiers in rank order (chronological order)
    for (const rank of ranks) {
      const count = rankCounts[rank];
      for (let i = 0; i < count; i++) {
        const serviceNo = String(serviceNoCounter++);
        const firstName = bengaliFirstNames[Math.floor(Math.random() * bengaliFirstNames.length)];
        const lastName = bengaliLastNames[Math.floor(Math.random() * bengaliLastNames.length)];
        const name = `${firstName} ${lastName}`;

        const soldier = {
          service_number: serviceNo,
          name: name,
          rank: rank,
          company: 'Radio',
          role: 'soldier',
          password_hash: hash
        };

        soldiers.push(soldier);
      }
    }

    // Insert all soldiers
    await User.insertMany(soldiers);
    console.log('\n✓ Created 48 soldiers for Radio Company\n');

    // Display soldier details
    console.log('Soldier Details (by Rank):');
    console.log('================');
    
    for (const rank of ranks) {
      const rankSoldiers = soldiers.filter(s => s.rank === rank);
      console.log(`\n${rank} (${rankSoldiers.length}):`);
      rankSoldiers.forEach((s, idx) => {
        console.log(`  ${idx + 1}. ${s.service_number} - ${s.name}`);
      });
    }

    console.log('\n✓ Radio Company Personal Roster Ready!');
    console.log('All soldiers have password: A#1234');
    console.log('Company: Radio');
    console.log('Total Soldiers: 48');
    console.log('  - SWO: 1');
    console.log('  - WO: 2');
    console.log('  - Sgt: 3');
    console.log('  - Cpl: 4');
    console.log('  - L/Cpl: 8');
    console.log('  - Snk: 30');

    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createRadioCompany();
