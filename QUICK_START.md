# Quick Start Guide - Setting Up ParadeOps Database

This guide will help you set up the database for ParadeOps in under 15 minutes.

## Option A: XAMPP (Easiest - Recommended for Beginners)

### Step 1: Install XAMPP
1. Download XAMPP from https://www.apachefriends.org/
2. Install XAMPP (accept all defaults)
3. Start XAMPP Control Panel

### Step 2: Start Services
1. Click "Start" next to **Apache**
2. Click "Start" next to **MySQL**
3. Wait for both to show green "Running" status

### Step 3: Create Database
1. Click "Admin" next to MySQL (opens phpMyAdmin in browser)
2. Click "New" in left sidebar
3. Database name: `parade_ops`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

### Step 4: Import Schema
1. Click on `parade_ops` database in left sidebar
2. Click "Import" tab at top
3. Click "Choose File"
4. Navigate to `database/schema.sql`
5. Click "Go" at bottom
6. Wait for success message

### Step 5: Import Sample Data (Optional)
1. Stay on Import tab
2. Click "Choose File"
3. Navigate to `database/sample_data.sql`
4. Click "Go"
5. Wait for success message

### Step 6: Configure Backend
1. Open `backend/config/database.php`
2. Verify these settings:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'parade_ops');
   define('DB_USER', 'root');
   define('DB_PASS', '');  // Empty for XAMPP
   ```

### Step 7: Move Files
1. Copy your entire project folder to `C:\xampp\htdocs\`
2. Rename folder to `parade_ops`
3. Your project is now at: `C:\xampp\htdocs\parade_ops\`

### Step 8: Test
1. Open browser
2. Go to: `http://localhost/parade_ops/login.html`
3. Try logging in with test credentials:
   - **Username:** `soldier`
   - **Password:** `1234`
   - **Role:** Soldier

### Step 9: Update Frontend (Make API Calls)
Your HTML files currently use localStorage. To use the database, update JavaScript:

**Example - Update login.html:**
```javascript
// OLD CODE (localStorage):
const userCredentials = credentials[role];
if (userCredentials && username === userCredentials.username && password === userCredentials.password) {
    window.location.href = userCredentials.dashboard;
}

// NEW CODE (Database API):
fetch('backend/api/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = data.dashboard;
    } else {
        alert(data.error);
    }
})
.catch(error => {
    alert('Login failed: ' + error.message);
});
```

## Option B: SQLite (No Server Required)

### Step 1: Install SQLite
**Windows:**
1. Download from https://www.sqlite.org/download.html
2. Extract `sqlite3.exe` to project folder

**Mac/Linux:**
```bash
# Already installed on most systems
sqlite3 --version
```

### Step 2: Create Database
```bash
cd /path/to/parade_ops
sqlite3 database/parade_ops.db
```

### Step 3: Import Schema
```sql
.read database/schema_sqlite.sql
.quit
```

### Step 4: Verify
```bash
sqlite3 database/parade_ops.db "SELECT * FROM companies;"
```

## Option C: MySQL Command Line (For Developers)

### Step 1: Install MySQL
```bash
# Ubuntu/Debian
sudo apt-get install mysql-server

# Mac (using Homebrew)
brew install mysql

# Start MySQL
sudo systemctl start mysql  # Linux
brew services start mysql   # Mac
```

### Step 2: Create Database and User
```bash
mysql -u root -p
```

```sql
CREATE DATABASE parade_ops CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'parade_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON parade_ops.* TO 'parade_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Import Schema
```bash
mysql -u parade_user -p parade_ops < database/schema.sql
mysql -u parade_user -p parade_ops < database/sample_data.sql
```

### Step 4: Update Configuration
Edit `backend/config/database.php`:
```php
define('DB_USER', 'parade_user');
define('DB_PASS', 'secure_password_here');
```

## Testing the Database

### Test 1: Check Tables
```sql
-- MySQL/MariaDB
mysql -u root -p parade_ops
SHOW TABLES;

-- SQLite
sqlite3 database/parade_ops.db
.tables
```

You should see:
- users
- companies
- soldiers
- leave_requests
- attendance_records
- daily_parade_state
- notices
- duty_roster
- audit_log

### Test 2: Check Sample Data
```sql
SELECT * FROM companies;
SELECT * FROM users;
```

### Test 3: Test Login API
```bash
curl -X POST http://localhost/parade_ops/backend/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"username":"soldier","password":"1234","role":"soldier"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "...",
  "user": {...}
}
```

## Default Test Credentials

After importing sample_data.sql, use these credentials:

| Username | Password | Role |
|----------|----------|------|
| co | 1234 | Commanding Officer |
| coycomd | 1234 | Company Commander |
| adjt | 1234 | Adjutant |
| bsm | 1234 | BSM |
| soldier | 1234 | Soldier |

⚠️ **Security Warning:** Change these passwords immediately in production!

## Common Issues and Solutions

### Issue 1: "Access Denied for user 'root'@'localhost'"
**Solution:** Reset MySQL root password
```bash
# XAMPP: Set password in phpMyAdmin
# Linux: sudo mysql_secure_installation
```

### Issue 2: "Database connection failed"
**Solution:** 
1. Check if MySQL is running
2. Verify credentials in `database.php`
3. Check if database exists: `SHOW DATABASES;`

### Issue 3: "CORS Error" in browser console
**Solution:** The backend files already include CORS headers. Make sure you're accessing via `http://localhost` not `file://`

### Issue 4: PHP files download instead of executing
**Solution:** 
1. Make sure Apache is running
2. Access via `http://localhost/parade_ops/` not by opening files directly
3. Check PHP is enabled in Apache

### Issue 5: "Cannot find database.php"
**Solution:** Check file paths. API files should be in `backend/api/`, config in `backend/config/`

## Production Deployment Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Use strong password hashing (bcrypt with cost 12+)
- [ ] Enable HTTPS/SSL
- [ ] Restrict database access (create limited-privilege user)
- [ ] Update CORS settings (remove `*`, specify allowed origins)
- [ ] Enable PHP error logging (disable display_errors)
- [ ] Set up database backups
- [ ] Implement proper session management or JWT
- [ ] Add input validation and sanitization
- [ ] Enable audit logging
- [ ] Test all API endpoints
- [ ] Set up monitoring and alerts

## Next Steps

1. ✅ Database is set up
2. ✅ Test credentials work
3. 🔄 Update frontend HTML files to use API calls instead of localStorage
4. 🔄 Test each page functionality
5. 🔄 Add proper authentication to all pages
6. 🔄 Deploy to production server

## Need Help?

- **Database Issues:** Check MySQL/MariaDB documentation
- **PHP Issues:** Check `error_log` in XAMPP/htdocs folder
- **API Issues:** Use browser Developer Tools → Network tab
- **General Help:** See DATABASE_SETUP.md for detailed information

## Useful Commands

```bash
# Check if MySQL is running
sudo systemctl status mysql    # Linux
brew services list             # Mac

# Access MySQL console
mysql -u root -p

# Backup database
mysqldump -u root -p parade_ops > backup.sql

# Restore database
mysql -u root -p parade_ops < backup.sql

# Check PHP version
php -v

# Test PHP syntax
php -l backend/api/login.php
```

## Success Indicators

✅ You've successfully set up the database when:
1. phpMyAdmin shows `parade_ops` database with 9 tables
2. You can login via test credentials
3. API endpoint returns JSON response
4. No errors in browser console (F12)
5. Leave requests can be created and retrieved

---

**You're all set! Your database is ready for use.** 🎉

For detailed API documentation and advanced configuration, see `DATABASE_SETUP.md`.
