# Database Setup Guide for ParadeOps

## Overview
This guide explains how to create and configure a database for the ParadeOps project. Currently, the application uses browser localStorage for data persistence. This guide will help you transition to a proper database system.

## Current Data Structure Analysis

The ParadeOps application manages the following data:

1. **Users/Authentication**
   - Roles: Commanding Officer, Company Commander, Adjutant, BSM, Soldier
   - Credentials (username, password)

2. **Soldiers**
   - Personal information (ID, Name, Rank, Company)
   - Leave balance (Annual, Casual, Recreational, Medical)
   - Attendance records

3. **Leave Requests**
   - Leave type, dates, reason
   - Approval workflow (Soldier → Company Commander → Adjutant → BSM → CO)
   - Status tracking

4. **Company Parade State**
   - Daily strength reports
   - Present, Leave, On Duty, AWOL counts per company

5. **Notices/Commitments**
   - Important notices from BSM/Adjutant to CO
   - Next day commitments

## Recommended Database Technologies

### Option 1: MySQL/MariaDB (Recommended for Production)
**Language:** SQL  
**Best for:** Production environments, military systems requiring high reliability

**Advantages:**
- Industry standard, highly reliable
- Excellent for structured military data
- Strong ACID compliance (data integrity)
- Wide support and documentation
- Works well with PHP, Python, Node.js backends

**Setup Steps:**
1. Install MySQL: `sudo apt-get install mysql-server` (Linux) or download from mysql.com
2. Create database: `mysql -u root -p` then `CREATE DATABASE parade_ops;`
3. Run schema file: `mysql -u root -p parade_ops < database/schema.sql`
4. Configure connection in backend (see Backend Integration section)

### Option 2: PostgreSQL
**Language:** SQL  
**Best for:** Advanced features, complex queries

**Advantages:**
- More advanced SQL features
- Better for complex reporting
- Excellent data integrity
- Open source

**Setup Steps:**
1. Install PostgreSQL: `sudo apt-get install postgresql` (Linux)
2. Create database: `sudo -u postgres createdb parade_ops`
3. Run schema: `psql -U postgres -d parade_ops -f database/schema.sql`

### Option 3: SQLite
**Language:** SQL  
**Best for:** Development, testing, small deployments

**Advantages:**
- No server required (file-based)
- Easy setup
- Perfect for learning and development
- Can be used for small unit deployments

**Setup Steps:**
1. Install SQLite: `sudo apt-get install sqlite3`
2. Create database: `sqlite3 database/parade_ops.db`
3. Run schema: `.read database/schema.sql`

### Option 4: MongoDB
**Language:** NoSQL (JSON-like documents)  
**Best for:** Flexible schema, rapid development

**Advantages:**
- Schema flexibility
- JSON-based (similar to current localStorage structure)
- Easy to learn
- Good for prototyping

**Setup Steps:**
1. Install MongoDB: Follow instructions at mongodb.com
2. Create database: Use MongoDB Compass or `mongosh`
3. Collections are created automatically when data is inserted

## Backend Implementation Language Options

You'll need a backend server to connect the frontend to the database. Here are recommended options:

### Option 1: PHP (Easiest for Beginners)
**Why PHP:**
- Simple to learn
- Widely supported by hosting providers
- Great documentation
- Works perfectly with MySQL

**Example structure:**
```
backend/
  ├── config/
  │   └── database.php       # Database connection
  ├── api/
  │   ├── login.php          # Authentication endpoint
  │   ├── soldiers.php       # Soldier data
  │   ├── leave_requests.php # Leave management
  │   └── reports.php        # Report generation
  └── includes/
      └── functions.php      # Helper functions
```

### Option 2: Node.js + Express
**Why Node.js:**
- JavaScript (same language as frontend)
- Modern, fast
- Large ecosystem (npm packages)
- Great for real-time features

**Example structure:**
```
backend/
  ├── server.js              # Main server file
  ├── config/
  │   └── database.js        # Database connection
  ├── routes/
  │   ├── auth.js           # Authentication routes
  │   ├── soldiers.js       # Soldier routes
  │   └── leave.js          # Leave routes
  └── models/
      ├── User.js           # User model
      └── LeaveRequest.js   # Leave model
```

### Option 3: Python + Flask/Django
**Why Python:**
- Clean, readable syntax
- Excellent for data processing
- Django has built-in admin panel
- Good for military/government systems

**Example structure:**
```
backend/
  ├── app.py                # Main Flask app
  ├── config.py             # Configuration
  ├── models/
  │   ├── user.py
  │   └── leave_request.py
  └── routes/
      ├── auth.py
      └── api.py
```

## Quick Start Recommendation

**For beginners, we recommend:**
1. **Database:** MySQL (most widely used, best documentation)
2. **Backend Language:** PHP (easiest to learn, widely supported)
3. **Development Environment:** XAMPP or WAMP (includes MySQL, PHP, Apache)

**Setup XAMPP (Windows/Mac/Linux):**
1. Download XAMPP from apachefriends.org
2. Install and start Apache and MySQL services
3. Place your HTML files in `htdocs/parade_ops/`
4. Create PHP files in `htdocs/parade_ops/backend/`
5. Access via `http://localhost/parade_ops/`

## Database Files Included

This project includes the following database files:

1. **`database/schema.sql`** - MySQL/PostgreSQL database schema
2. **`database/schema_sqlite.sql`** - SQLite version
3. **`database/sample_data.sql`** - Sample data for testing
4. **`backend/config/database.php`** - PHP database connection example
5. **`backend/api/login.php`** - Example authentication endpoint

## Migration from localStorage to Database

To migrate from localStorage to database:

1. **Setup database** using one of the options above
2. **Create backend API** endpoints
3. **Update frontend JavaScript** to call API instead of localStorage
4. **Test thoroughly** before deploying

Example change:
```javascript
// OLD (localStorage)
localStorage.setItem('leaveRequests', JSON.stringify(requests));

// NEW (database via API)
fetch('/backend/api/leave_requests.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requests)
});
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Never store passwords in plain text** - Use password hashing (bcrypt, argon2)
2. **Use prepared statements** - Prevent SQL injection attacks
3. **Implement authentication** - Use sessions or JWT tokens
4. **HTTPS only** - Always use SSL/TLS in production
5. **Input validation** - Validate all user inputs
6. **Access control** - Implement role-based permissions

## Next Steps

1. Choose your database system (we recommend MySQL for production)
2. Choose your backend language (we recommend PHP for beginners)
3. Install required software (XAMPP is easiest)
4. Run the database schema file to create tables
5. Test with sample data
6. Implement backend API endpoints
7. Update frontend to use API calls

## Need Help?

- MySQL Documentation: https://dev.mysql.com/doc/
- PHP Documentation: https://www.php.net/docs.php
- XAMPP Tutorial: https://www.apachefriends.org/
- Node.js Documentation: https://nodejs.org/docs/
- Python Flask: https://flask.palletsprojects.com/

## Support

For project-specific questions, refer to the schema file and example backend implementations included in this repository.
