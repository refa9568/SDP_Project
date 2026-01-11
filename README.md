# ParadeOps - Military Personnel Management System

A comprehensive web-based system for managing military personnel, leave requests, daily parade states, and battalion operations.

## 🎯 Project Overview

ParadeOps is a real-time manpower readiness dashboard designed for military units to efficiently manage:
- Personnel information and strength tracking
- Leave request workflow (approval chain)
- Daily attendance and parade state reporting
- Company and battalion-level reporting
- Notice board and commitments management

## 🚀 Quick Start

### Option 1: Quick Setup with XAMPP (Easiest)

1. **Install XAMPP** (includes Apache, MySQL, PHP)
2. **Start Apache and MySQL** services
3. **Create database** named `parade_ops` in phpMyAdmin
4. **Import schema** from `database/schema.sql`
5. **Import sample data** from `database/sample_data.sql`
6. **Configure backend** - Update `backend/config/database.php` if needed
7. **Access application** at `http://localhost/parade_ops/login.html`

📖 **Detailed instructions:** See [QUICK_START.md](QUICK_START.md)

### Option 2: Manual Setup

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for comprehensive setup instructions including:
- MySQL/PostgreSQL/SQLite setup
- PHP/Node.js backend configuration
- Security best practices
- Production deployment guide

## 📁 Project Structure

```
SDP_Project/
├── login.html                 # Main login page
├── frontend/                  # All frontend HTML pages
│   ├── soldier/              # Soldier self-service portal
│   ├── coy_commander/        # Company commander dashboard
│   ├── adjutant/             # Adjutant dashboard
│   ├── bsm/                  # Battalion Sergeant Major dashboard
│   └── CO/                   # Commanding Officer dashboard
├── database/                  # Database schema and sample data
│   ├── schema.sql            # MySQL/MariaDB schema
│   ├── schema_sqlite.sql     # SQLite schema
│   └── sample_data.sql       # Test data with sample users
├── backend/                   # Backend API (PHP & Node.js examples)
│   ├── config/               # Database configuration
│   │   └── database.php
│   ├── api/                  # API endpoints
│   │   ├── login.php
│   │   └── leave_requests.php
│   ├── server.js             # Node.js alternative backend
│   ├── package.json
│   └── README.md             # Backend documentation
├── DATABASE_SETUP.md          # Comprehensive database guide
├── QUICK_START.md            # Quick setup guide
└── README.md                 # This file
```

## 🔐 Default Test Credentials

After importing sample data, use these credentials for testing:

| Username | Password | Role |
|----------|----------|------|
| co | 1234 | Commanding Officer |
| coycomd | 1234 | Company Commander |
| adjt | 1234 | Adjutant |
| bsm | 1234 | Battalion Sergeant Major |
| soldier | 1234 | Soldier |

⚠️ **Important:** Change these passwords before production deployment!

## 💾 Database Information

### Current Implementation
The frontend currently uses **browser localStorage** for data persistence. This is a temporary solution for development/prototyping.

### Recommended Implementation
For production use, implement a proper database backend:

**Recommended Stack:**
- **Database:** MySQL/MariaDB (most reliable for military systems)
- **Backend:** PHP (easiest to deploy) or Node.js (modern alternative)
- **Server:** Apache (via XAMPP) or Nginx

### Database Features
- User authentication with role-based access
- Soldier profile management
- Leave request workflow with multi-level approval
- Daily parade state tracking
- Attendance records
- Notice board system
- Duty roster management
- Comprehensive audit logging

## 🎨 User Roles & Features

### 1. Soldier
- View personal information and leave balance
- Apply for leave (Annual, Casual, Recreational, Medical)
- Check leave request status
- View daily attendance
- Receive approval notifications

### 2. Company Commander
- Manage company personnel
- Approve/reject leave requests (first level)
- Submit daily parade state
- Generate company reports
- View company strength summary

### 3. Adjutant
- Oversee all leave requests (second level approval)
- View daily parade state across all companies
- Generate weekly summaries
- Manage leave history
- Send notices to CO

### 4. Battalion Sergeant Major (BSM)
- Review battalion strength summary
- Approve leave requests (third level)
- Forward consolidated reports to CO
- Send next day commitments to CO/Adjutant
- Monitor company submissions

### 5. Commanding Officer (CO)
- Final leave approval authority
- View battalion strength reports
- Monitor all company parade states
- Receive notices and commitments
- Generate battalion-level reports
- Dashboard with comprehensive overview

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Page structure
- **CSS3** - Styling with military theme
- **JavaScript (ES6+)** - Interactivity and logic
- Currently uses **localStorage** (to be replaced with API calls)

### Backend Options

#### Option A: PHP (Recommended for beginners)
- **Language:** PHP 7.4+
- **Database Driver:** PDO with MySQL
- **Server:** Apache (XAMPP)
- **Security:** Prepared statements, bcrypt password hashing

#### Option B: Node.js (Modern alternative)
- **Runtime:** Node.js 14+
- **Framework:** Express.js
- **Database Driver:** mysql2
- **Authentication:** JWT (JSON Web Tokens)

### Database
- **Primary:** MySQL 8.0+ / MariaDB 10.5+
- **Alternative:** PostgreSQL 12+ or SQLite 3 (for development)
- **Schema:** Fully normalized with foreign keys and indexes
- **Security:** Hashed passwords, audit logging

## 📊 Database Schema

The database includes these main tables:
- `users` - Authentication and user accounts
- `companies` - Military company/unit information
- `soldiers` - Personnel records with leave balances
- `leave_requests` - Leave applications with approval workflow
- `attendance_records` - Daily attendance tracking
- `daily_parade_state` - Company strength reports
- `notices` - Notice board and commitments
- `duty_roster` - Duty assignments
- `audit_log` - Security and compliance audit trail

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for complete schema details.

## 🔄 Migration from localStorage to Database

To connect the frontend to the database:

1. **Update login.html:**
```javascript
// Replace localStorage credentials check with API call
fetch('backend/api/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        sessionStorage.setItem('token', data.token);
        window.location.href = data.dashboard;
    }
});
```

2. **Update data operations:**
```javascript
// OLD: localStorage.getItem('leaveRequests')
// NEW:
fetch('backend/api/leave-requests.php', {
    headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
})
.then(r => r.json())
.then(data => {
    // Use data.data array
});
```

See backend examples in `backend/api/` directory.

## 🔒 Security Features

- **Password Hashing:** bcrypt with cost factor 10+
- **SQL Injection Prevention:** Prepared statements
- **CSRF Protection:** Token validation
- **XSS Prevention:** Input sanitization
- **Authentication:** Session-based (PHP) or JWT (Node.js)
- **Audit Logging:** All critical actions logged
- **Role-based Access Control:** User permissions enforced
- **HTTPS Ready:** SSL/TLS support for production

## 📱 Responsive Design

All pages are responsive and work on:
- Desktop computers (1920x1080 and above)
- Laptops (1366x768)
- Tablets (768px and above)
- Mobile devices (partial support)

## 🚀 Deployment

### Development
```bash
# Using XAMPP
1. Copy to C:\xampp\htdocs\parade_ops\
2. Start Apache and MySQL
3. Access at http://localhost/parade_ops/

# Using Node.js
cd backend
npm install
npm start
# Access at http://localhost:3000/
```

### Production

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for production deployment checklist including:
- Security hardening
- Database optimization
- SSL/TLS configuration
- Backup strategy
- Monitoring setup

## 📖 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get up and running in 15 minutes
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Comprehensive database guide
- **[backend/README.md](backend/README.md)** - API documentation and backend guide

## 🐛 Troubleshooting

### Common Issues

**Database connection failed:**
- Check MySQL is running
- Verify credentials in `backend/config/database.php`
- Ensure database `parade_ops` exists

**API not working:**
- Check Apache is running (for PHP backend)
- Verify file paths are correct
- Check browser console for errors
- Ensure CORS is configured

**Login not working:**
- Verify sample data is imported
- Check browser console for errors
- Ensure you're accessing via `http://localhost` not `file://`

See [QUICK_START.md](QUICK_START.md) for more troubleshooting tips.

## 🤝 Contributing

This is an academic/military project. For contributions:
1. Understand the military chain of command workflow
2. Follow existing code style and conventions
3. Test thoroughly before committing
4. Document all changes

## 📄 License

This project is intended for military use and educational purposes.

## 👥 Credits

Developed for military personnel management and battalion operations.

## 📞 Support

For setup help:
1. Check [QUICK_START.md](QUICK_START.md)
2. Review [DATABASE_SETUP.md](DATABASE_SETUP.md)
3. Check backend logs for errors
4. Verify database connectivity

## 🎯 Project Status

✅ Frontend UI complete
✅ Database schema designed
✅ Sample data created
✅ Backend API examples (PHP & Node.js)
🔄 Migration from localStorage to database (in progress)
⏳ Production deployment guide

---

**Version:** 1.0.0  
**Last Updated:** January 2026
