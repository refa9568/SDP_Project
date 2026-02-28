const mongoose = require('mongoose');
const User = require('./src/models/User');

async function fixSoldierNames() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradeops_db');
    console.log('✓ MongoDB connected');
    console.log('📝 Updating soldier names with modern Bengali Muslim names...\n');

    // Special names for specific soldiers
    const specialNames = {
      '1111001': 'Suraiya Mustari Labiba',
      '1111002': 'Refa Jahan',
      '1111003': 'Iftiak Ahmed',
      '1111004': 'Anisa Hossain'
    };

    // Modern Bengali Muslim names (first names)
    const bengaliFirstNames = [
      'Farhan', 'Faisal', 'Imran', 'Iqbal', 'Arif', 'Amir', 'Amaan',
      'Biplav', 'Bashir', 'Bilal', 'Babar', 'Bahauddin', 'Badrul',
      'Chayan', 'Chowdhury', 'Choudhury', 'Chand', 'Charef',
      'Daud', 'Dipal', 'Danish', 'Danesh', 'Darshan', 'Darwish',
      'Emir', 'Essa', 'Eshaque', 'Emad', 'Enayat',
      'Fahim', 'Furquan', 'Fareed', 'Farah', 'Faruq', 'Faizul',
      'Golam', 'Gulam', 'Gias', 'Gaus', 'Galib', 'Ghias',
      'Habib', 'Haider', 'Hamid', 'Hasan', 'Harun', 'Hasib',
      'Iftikhar', 'Ikram', 'Iqram', 'Ismail', 'Israr', 'Ishaq',
      'Jamal', 'Jalil', 'Javed', 'Jamir', 'Jamil', 'Jafar',
      'Kamal', 'Karim', 'Kamran', 'Kalam', 'Kalim', 'Karimi',
      'Laiq', 'Liaquat', 'Latif', 'Labon', 'Labib', 'Labir',
      'Mahmud', 'Masum', 'Mahdeen', 'Mahir', 'Makar', 'Makram',
      'Nasir', 'Naseem', 'Naser', 'Niaz', 'Naim', 'Naem',
      'Omar', 'Osman', 'Owais', 'Obaid', 'Ohab',
      'Parvez', 'Parham', 'Pasha', 'Palekar', 'Parin',
      'Qadir', 'Qasem', 'Qais', 'Qamran', 'Qudrat', 'Quresh',
      'Rafiq', 'Rasul', 'Rauf', 'Rayan', 'Raza', 'Razib',
      'Sadiq', 'Samir', 'Saud', 'Salim', 'Saleem', 'Saad',
      'Talib', 'Tariq', 'Taufiq', 'Tawfiq', 'Tamim', 'Tawhid',
      'Usman', 'Umer', 'Ubaid', 'Uzair', 'Upkar',
      'Vasim', 'Vikram', 'Vedant', 'Valdez', 'Vihaan',
      'Wahid', 'Waqar', 'Walid', 'Wamiq', 'Wasim',
      'Yahya', 'Yaseen', 'Yasir', 'Yashid', 'Yousuf',
      'Zamir', 'Zaman', 'Zafar', 'Zahir', 'Zaki', 'Zaid'
    ];

    // Modern Bengali Muslim last names
    const bengaliLastNames = [
      'Khan', 'Ahmed', 'Ali', 'Hassan', 'Hossain', 'Hussain',
      'Chowdhury', 'Choudhury', 'Choudhari', 'Choudhary',
      'Sheikh', 'Shaikh', 'Siddiqui', 'Siddique',
      'Mirza', 'Malik', 'Mahmud', 'Maulvi',
      'Qureshi', 'Quadri', 'Qazi',
      'Pasha', 'Patel', 'Padshah',
      'Noor', 'Nur', 'Naqvi',
      'Mansur', 'Manna',
      'Latif', 'Latifur',
      'Karim', 'Kareem', 'Karimi',
      'Jahan', 'Jahangir',
      'Habib', 'Habibi',
      'Farooq', 'Fakhri',
      'Baig', 'Bahar', 'Baki',
      'Aziz', 'Azad', 'Alam',
      'Ansari', 'Anwar',
      'Yousuf', 'Younus',
      'Yaqub', 'Yaseen',
      'Wazir', 'Wasim',
      'Zaman', 'Zahid',
      'Tariq', 'Tasnim',
      'Sultan', 'Suleiman',
      'Rafiq', 'Rahman',
      'Qadri', 'Qayyum',
      'Nasir', 'Nasreen',
      'Momin', 'Momen',
      'Labiba', 'Labib',
      'Kadir', 'Kadeer',
      'Iqbal', 'Iqraam',
      'Hassan', 'Hasnat',
      'Habibur', 'Habibullah',
      'Gias', 'Giasuddin',
      'Farhan', 'Farhapie',
      'Enamul', 'Enayat',
      'Deen', 'Din',
      'Baqui', 'Bari',
      'Amin', 'Amine',
      'Abbas', 'Abbasi'
    ];

    // Find all soldiers AND update special admin users separately
    const soldiers = await User.find({ role: 'soldier' }).sort({ service_number: 1 });
    
    // Update special admin users first
    console.log(`📋 Found ${soldiers.length} soldiers\n`);
    console.log('🔄 Updating special admin users...\n');

    let updated = 0;
    let errors = 0;

    // Update special admin personnel
    for (const [serviceNo, name] of Object.entries(specialNames)) {
      try {
        const user = await User.findOne({ service_number: serviceNo });
        if (user) {
          await User.updateOne(
            { _id: user._id },
            { name: name }
          );
          console.log(`✓ Updated ${serviceNo}: "${user.name}" → "${name}"`);
          updated++;
        }
      } catch (err) {
        console.error(`✗ Failed to update ${serviceNo}:`, err.message);
        errors++;
      }
    }

    console.log('\n🔄 Updating soldier names...\n');

    for (let i = 0; i < soldiers.length; i++) {
      const soldier = soldiers[i];
      let newName;

      // Check if this soldier has a special custom name (shouldn't happen, but just in case)
      if (specialNames[soldier.service_number]) {
        newName = specialNames[soldier.service_number];
      } else {
        // Generate a modern Bengali Muslim name
        const firstNameIndex = i % bengaliFirstNames.length;
        const lastNameIndex = i % bengaliLastNames.length;
        newName = `${bengaliFirstNames[firstNameIndex]} ${bengaliLastNames[lastNameIndex]}`;
      }

      try {
        await User.updateOne(
          { _id: soldier._id },
          { name: newName }
        );
        console.log(`✓ Updated ${soldier.service_number}: "${soldier.name}" → "${newName}"`);
        updated++;
      } catch (err) {
        console.error(`✗ Failed to update ${soldier.service_number}:`, err.message);
        errors++;
      }
    }

    console.log(`\n✅ Updated: ${updated} soldiers`);
    if (errors > 0) console.log(`❌ Failed: ${errors} soldiers`);
    console.log('\n✨ All soldiers now have modern Bengali Muslim names! 🎉\n');

    // Show the special names that were updated
    console.log('📌 Special Names Updated:');
    console.log(`   1111001: Suraiya Mustari Labiba`);
    console.log(`   1111002: Refa Jahan`);
    console.log(`   1111003: Iftiak Ahmed`);
    console.log(`   1111004: Anisa Hossain\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

fixSoldierNames();
