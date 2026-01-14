const pool = require('./database/database');

async function check() {
    try {
        // Check leaves table structure
        const [columns] = await pool.query("DESCRIBE leaves");
        console.log('Leaves table columns:');
        columns.forEach(c => console.log(`  ${c.Field}: ${c.Type} ${c.Null === 'NO' ? 'NOT NULL' : ''}`));
        
        // Check leave_types
        const [types] = await pool.query("SELECT * FROM leave_types");
        console.log('\nLeave types:');
        types.forEach(t => console.log(`  ${t.leave_type_id}: ${t.type_name}`));
        
        // Try to insert
        console.log('\nTrying to insert leave...');
        const [result] = await pool.query(
            `INSERT INTO leaves (user_id, leave_type_id, start_date, end_date, days, reason, status)
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [1, 1, '2026-01-20', '2026-01-25', 6, 'Test reason']
        );
        console.log('Inserted leave_id:', result.insertId);
        
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit();
}

check();
