const pool = require('./database/database');

async function check() {
    const [rows] = await pool.query("SELECT service_number, name, role FROM users WHERE role = 'soldier' LIMIT 5");
    console.log('Soldiers in database:');
    rows.forEach(u => console.log(u.service_number, '-', u.name));
    process.exit();
}

check();
