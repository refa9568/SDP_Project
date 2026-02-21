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

// Bangladeshi names for soldiers
const bangladeshiNames = {
  firstNames: [
    'Rahman', 'Ahmed', 'Islam', 'Hossain', 'Ali', 'Hasan', 'Hussain', 'Khan',
    'Mahmud', 'Abdullah', 'Ibrahim', 'Umar', 'Omar', 'Yusuf', 'Muhammad',
    'Abdul', 'Karim', 'Rahim', 'Salam', 'Jamil', 'Kamal', 'Jamal', 'Rafiq',
    'Rashid', 'Fazal', 'Mizan', 'Sultan', 'Aziz', 'Mahmood', 'Faruq',
    'Anwar', 'Bashir', 'Nasir', 'Faisal', 'Tariq', 'Zahid', 'Wahid', 'Masud',
    'Rashed', 'Sayed', 'Shaikh', 'Mollah', 'Chowdhury', 'Mondal', 'Sarker',
    'Biswas', 'Das', 'Roy', 'Paul', 'Ghosh', 'Banerjee', 'Saha', 'Mitra'
  ],
  lastNames: [
    'Ahmed', 'Khan', 'Islam', 'Hossain', 'Ali', 'Hasan', 'Rahman', 'Chowdhury',
    'Mondal', 'Sarker', 'Biswas', 'Das', 'Roy', 'Paul', 'Ghosh', 'Banerjee',
    'Saha', 'Mitra', 'Mia', 'Mollah', 'Shaikh', 'Sayed', 'Akter', 'Begum',
    'Khatun', 'Parvin', 'Sultana', 'Yasmin', 'Kamal', 'Jamal', 'Rashid',
    'Karim', 'Rahim', 'Salam', 'Jamil', 'Rafiq', 'Fazal', 'Mizan', 'Sultan'
  ]
};

function generateBangladeshiName() {
  const firstName = bangladeshiNames.firstNames[Math.floor(Math.random() * bangladeshiNames.firstNames.length)];
  const lastName = bangladeshiNames.lastNames[Math.floor(Math.random() * bangladeshiNames.lastNames.length)];
  return `${firstName} ${lastName}`;
}

function generateEmail(name, serviceNumber) {
  // Convert name to lowercase and remove spaces, use first part
  const emailName = name.toLowerCase().split(' ')[0];
  return `${emailName}${serviceNumber.slice(-2)}@gmail.com`;
}

function generatePhone(serviceNumber) {
  // Pattern: 017690000[last 3 digits of service number]
  const lastThree = serviceNumber.slice(-3);
  return `01769000${lastThree}`;
}

async function addSoldiers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradeops_db');

    const password = 'A#1234';
    const hashedPassword = await bcrypt.hash(password, 10);

    let serviceNumber = 1111405; // Starting service number
    const soldiers = [];

    // 5 Sergeants
    for (let i = 0; i < 5; i++) {
      const name = generateBangladeshiName();
      const soldier = {
        service_number: serviceNumber.toString(),
        name: name,
        rank: 'Sergeant',
        company: 'Radio', // Assign to Radio company
        role: 'soldier',
        email: generateEmail(name, serviceNumber.toString()),
        phone: generatePhone(serviceNumber.toString()),
        password_hash: hashedPassword
      };
      soldiers.push(soldier);
      serviceNumber++;
    }

    // 10 Corporals
    for (let i = 0; i < 10; i++) {
      const name = generateBangladeshiName();
      const soldier = {
        service_number: serviceNumber.toString(),
        name: name,
        rank: 'Corporal',
        company: 'Radio',
        role: 'soldier',
        email: generateEmail(name, serviceNumber.toString()),
        phone: generatePhone(serviceNumber.toString()),
        password_hash: hashedPassword
      };
      soldiers.push(soldier);
      serviceNumber++;
    }

    // 15 Lance Corporals
    for (let i = 0; i < 15; i++) {
      const name = generateBangladeshiName();
      const soldier = {
        service_number: serviceNumber.toString(),
        name: name,
        rank: 'Lance Corporal',
        company: 'Radio',
        role: 'soldier',
        email: generateEmail(name, serviceNumber.toString()),
        phone: generatePhone(serviceNumber.toString()),
        password_hash: hashedPassword
      };
      soldiers.push(soldier);
      serviceNumber++;
    }

    // 60 Soldiers
    for (let i = 0; i < 60; i++) {
      const name = generateBangladeshiName();
      const soldier = {
        service_number: serviceNumber.toString(),
        name: name,
        rank: 'Soldier',
        company: 'Radio',
        role: 'soldier',
        email: generateEmail(name, serviceNumber.toString()),
        phone: generatePhone(serviceNumber.toString()),
        password_hash: hashedPassword
      };
      soldiers.push(soldier);
      serviceNumber++;
    }

    console.log(`Adding ${soldiers.length} soldiers to the database...`);

    // Insert all soldiers
    const result = await User.insertMany(soldiers);

    console.log(`✓ Successfully added ${result.length} soldiers to the database`);

    // Show summary
    const rankSummary = {};
    soldiers.forEach(soldier => {
      rankSummary[soldier.rank] = (rankSummary[soldier.rank] || 0) + 1;
    });

    console.log('\nRank distribution added:');
    Object.entries(rankSummary).forEach(([rank, count]) => {
      console.log(`- ${rank}: ${count}`);
    });

    console.log(`\nService numbers range: ${soldiers[0].service_number} - ${soldiers[soldiers.length - 1].service_number}`);
    console.log('All soldiers assigned to Radio company');
    console.log('Password for all: A#1234');

  } catch (error) {
    console.error('Error adding soldiers:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the function
addSoldiers();