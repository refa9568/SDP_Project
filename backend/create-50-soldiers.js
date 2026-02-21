const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./src/models/User');

const ranks = ['Sepoy', 'Lance Naik', 'Naik', 'Naib Subedar', 'Subedar'];
const companies = ['Alpha', 'Bravo', 'Charlie', 'Delta'];

async function createSoldiers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/paradeops_db');
    console.log('Connected to MongoDB');

    // First, delete all soldiers except coy_comd and key users
    await User.deleteMany({
      role: 'soldier',
      company: 'Radio'
    });
    console.log('✓ Cleared existing Radio company soldiers');

    // Bengali names
    const bengaliFirstNames = [
      'Ayan', 'Arjun', 'Aritra', 'Abhishek', 'Avik', 'Arijit', 'Ashok',
      'Bimal', 'Biplav', 'Bhaskar', 'Biswajit', 'Bhat',
      'Chandan', 'Chirantan', 'Chiranjit', 'Chintamani',
      'Deben', 'Debasis', 'Diptendra', 'Dhaval', 'Dhiren',
      'Eshan', 'Eshwar',
      'Farhan', 'Faisal',
      'Girish', 'Gaurav', 'Goutam', 'Gobinda',
      'Harun', 'Harish', 'Hare', 'Hemant',
      'Iqbal', 'Inder',
      'Joydeep', 'Jayanta', 'Jiban', 'Jitendu',
      'Kanti', 'Krishnan', 'Kaushik', 'Karun',
      'Laxman', 'Lakshya', 'Lipak',
      'Mihir', 'Mithun', 'Mohan', 'Mriganka', 'Manas',
      'Nayan', 'Nishan', 'Nirmal', 'Naresh', 'Nripesh',
      'Ojas', 'Omkar',
      'Pankaj', 'Pradip', 'Prasun', 'Partha', 'Prabhat',
      'Raj', 'Ratan', 'Ravi', 'Ritwik', 'Rounak', 'Rudra',
      'Sujan', 'Suresh', 'Suman', 'Samir', 'Sankar', 'Subhash',
      'Tarun', 'Tapas', 'Tamal', 'Tushar',
      'Umesh', 'Ujjwal',
      'Vedant', 'Vikram', 'Vikas', 'Vishal',
      'Wajid', 'Walid',
      'Yashwant', 'Yajendra',
      'Zaman', 'Zorawar'
    ];

    const bengaliLastNames = [
      'Roy', 'Nath', 'Das', 'Dey', 'Bose', 'Chakraborty', 'Chatterjee', 'Banerjee',
      'Gupta', 'Sharma', 'Verma', 'Maurya', 'Singh', 'Khan', 'Ahmad',
      'Pal', 'Mukherjee', 'Chowdhury', 'Saha', 'Ghosh', 'Bhattacharya',
      'Dutta', 'Sengupta', 'Goswami', 'Mitra', 'Bhat', 'Joshi',
      'Bhowmik', 'Biswas', 'Mazumdar', 'Moitra', 'Tandon', 'Raha',
      'Sinha', 'Dutta', 'Misra', 'Tripathi', 'Pandey', 'Agarwal',
      'Chatterjee', 'Dutt', 'Nandi', 'Bakshi', 'Mitra', 'Chakraborti'
    ];

    // Generate 100 soldiers
    const hash = await bcrypt.hash('A#1234', 10);
    const soldiers = [];

    for (let i = 1; i <= 100; i++) {
      const serviceNo = String(1111405 + (i - 1));
      let rank;
      if (i <= 5) rank = 'Sergeant';
      else if (i <= 15) rank = 'Corporal';
      else if (i <= 30) rank = 'Lance Corporal';
      else rank = 'Soldier';
      const company = 'Radio'; // All in Radio company for this coy_comd
      
      // Bengali names
      const firstNames = [
        'Ayan', 'Arjun', 'Aritra', 'Abhishek', 'Avik', 'Arijit', 'Ashok',
        'Bimal', 'Biplav', 'Bhaskar', 'Biswajit', 'Bishal',
        'Chandan', 'Chirantan', 'Chiranjit', 'Chintamani',
        'Deben', 'Debasis', 'Diptendra', 'Dhaval', 'Dhiren',
        'Eshan', 'Eshwar',
        'Farhan', 'Faisal',
        'Girish', 'Gaurav', 'Goutam', 'Gobinda',
        'Harun', 'Harish', 'Hare', 'Hemant',
        'Iqbal', 'Inder',
        'Joydeep', 'Jayanta', 'Jiban', 'Jitendu',
        'Kanti', 'Krishnan', 'Kaushik', 'Karun',
        'Laxman', 'Lakshya', 'Lipak',
        'Mihir', 'Mithun', 'Mohan', 'Mriganka', 'Manas',
        'Nayan', 'Nishan', 'Nirmal', 'Naresh', 'Nripesh',
        'Ojas', 'Omkar',
        'Pankaj', 'Pradip', 'Prasun', 'Partha', 'Prabhat',
        'Raj', 'Ratan', 'Ravi', 'Ritwik', 'Rounak', 'Rudra',
        'Sujan', 'Suresh', 'Suman', 'Samir', 'Sankar', 'Subhash',
        'Tarun', 'Tapas', 'Tamal', 'Tushar',
        'Umesh', 'Ujjwal',
        'Vedant', 'Vikram', 'Vikas', 'Vishal',
        'Wajid', 'Walid',
        'Yashwant', 'Yajendra',
        'Zaman', 'Zorawar'
      ];
      const lastNames = [
        'Roy', 'Nath', 'Das', 'Dey', 'Bose', 'Chakraborty', 'Chatterjee', 'Banerjee',
        'Pal', 'Mukherjee', 'Chowdhury', 'Saha', 'Ghosh', 'Bhattacharya',
        'Dutta', 'Sengupta', 'Goswami', 'Mitra', 'Bhat', 'Joshi',
        'Bhowmik', 'Biswas', 'Mazumdar', 'Moitra', 'Tandon', 'Raha',
        'Sinha', 'Misra', 'Tripathi', 'Pandey', 'Agarwal',
        'Dutt', 'Nandi', 'Bakshi', 'Mitra', 'Chakraborti', 'Gupta', 'Sharma', 'Verma', 'Maurya', 'Singh', 'Khan', 'Ahmad'
      ];
      
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;

      soldiers.push({
        service_number: serviceNo,
        name: name,
        rank: rank,
        company: company,
        role: 'soldier',
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@army.mil`,
        phone: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        password_hash: hash
      });
    }

    // Insert all soldiers
    const created = await User.insertMany(soldiers);
    console.log(`\n✓ Created ${created.length} soldiers for Radio Company`);
    console.log('\nSoldier Details:');
    console.log('================');
    created.forEach((s, idx) => {
      console.log(`${idx + 1}. ${s.service_number} - ${s.name} (${s.rank})`);
    });

    console.log('\n✓ Personal Roster Ready!');
    console.log('All soldiers have password: A#1234');

    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createSoldiers();
