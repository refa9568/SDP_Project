# ParadeOps Backend

Backend API server for the ParadeOps Military Personnel Management System.

## Technology Stack

### Option 1: PHP Backend (Recommended for XAMPP)
- **Language:** PHP 7.4+
- **Database:** MySQL/MariaDB
- **Server:** Apache (via XAMPP)
- **Location:** `backend/api/` and `backend/config/`

### Option 2: Node.js Backend (Modern Alternative)
- **Language:** Node.js 14+
- **Framework:** Express.js
- **Database:** MySQL with mysql2 driver
- **Location:** `backend/server.js`

## Quick Start

### PHP Backend (XAMPP)

1. **Install XAMPP** from https://www.apachefriends.org/

2. **Start Services:**
   - Start Apache
   - Start MySQL

3. **Move Project:**
   - Copy project to `C:\xampp\htdocs\parade_ops\`

4. **Configure Database:**
   - Edit `backend/config/database.php`
   - Update credentials if needed (default works with XAMPP)

5. **Test API:**
   ```bash
   curl http://localhost/parade_ops/backend/api/login.php
   ```

### Node.js Backend

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start Server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

4. **Test API:**
   ```bash
   curl http://localhost:3000/api/login
   ```

## API Endpoints

### Authentication

#### POST /api/login
Login a user and receive authentication token.

**Request:**
```json
{
  "username": "soldier",
  "password": "1234",
  "role": "soldier"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "user_id": 5,
    "username": "soldier",
    "role": "soldier",
    "email": "soldier@paradeops.mil"
  },
  "dashboard": "frontend/soldier/soldier_dashboard.html"
}
```

### Leave Requests

#### GET /api/leave-requests
Get leave requests (filtered by user role).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "request_id": 1,
      "leave_type": "annual",
      "start_date": "2026-01-20",
      "end_date": "2026-01-25",
      "days_requested": 5,
      "status": "pending",
      "soldier_name": "Arman Silva",
      "rank": "WO",
      "company_name": "Radio Company"
    }
  ],
  "count": 1
}
```

#### POST /api/leave-requests
Create new leave request.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "soldier_id": 1,
  "leave_type": "annual",
  "start_date": "2026-01-20",
  "end_date": "2026-01-25",
  "days_requested": 5,
  "reason": "Family wedding",
  "address_on_leave": "123 Main St, Colombo",
  "contact_number": "+94771234567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "request_id": 1
}
```

#### PUT /api/leave-requests/:id
Approve or reject leave request.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "action": "approve",
  "remarks": "Approved for family emergency"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave request approved successfully"
}
```

### Parade State

#### GET /api/parade-state
Get daily parade state for all companies.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (defaults to today)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "company_name": "Headquarters",
      "company_code": "HQ",
      "total_strength": 120,
      "present": 110,
      "on_leave": 10,
      "on_duty": 5,
      "awol": 1
    }
  ]
}
```

## Database Configuration

### PHP Configuration
Edit `backend/config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'parade_ops');
define('DB_USER', 'root');
define('DB_PASS', '');
```

### Node.js Configuration
Edit `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=parade_ops
JWT_SECRET=your-secret-key-here
```

## Security Features

### Authentication
- **PHP:** Session-based with secure token generation
- **Node.js:** JWT (JSON Web Tokens) with expiration

### Password Security
- Passwords hashed using bcrypt (cost factor 10)
- Never stored in plain text

### SQL Injection Prevention
- **PHP:** PDO prepared statements
- **Node.js:** mysql2 prepared statements

### Input Validation
- All inputs sanitized before processing
- Required field validation
- Type checking

### CORS
- Configurable Cross-Origin Resource Sharing
- Restrict allowed origins in production

### Audit Logging
- All critical actions logged to `audit_log` table
- IP address tracking
- Timestamp recording

## Error Handling

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error description"
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 405: Method Not Allowed
- 500: Internal Server Error

## Testing

### Test with cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"soldier","password":"1234","role":"soldier"}'
```

**Get Leave Requests:**
```bash
curl http://localhost:3000/api/leave-requests \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test with Browser Console

```javascript
// Login
fetch('http://localhost:3000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'soldier',
    password: '1234',
    role: 'soldier'
  })
})
.then(r => r.json())
.then(data => {
  console.log(data);
  // Save token
  localStorage.setItem('token', data.token);
});

// Get Leave Requests
fetch('http://localhost:3000/api/leave-requests', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log(data));
```

## Production Deployment

### Before deploying to production:

1. **Security:**
   - [ ] Change all default passwords
   - [ ] Generate strong JWT secret
   - [ ] Enable HTTPS/SSL
   - [ ] Restrict CORS origins
   - [ ] Disable error details in responses
   - [ ] Enable rate limiting

2. **Database:**
   - [ ] Create dedicated database user with limited privileges
   - [ ] Enable database SSL connections
   - [ ] Set up automated backups
   - [ ] Configure connection pooling

3. **Logging:**
   - [ ] Configure production logging
   - [ ] Set up error monitoring
   - [ ] Enable audit trail

4. **Performance:**
   - [ ] Enable caching (Redis recommended)
   - [ ] Optimize database queries
   - [ ] Set up load balancing if needed

## Troubleshooting

### PHP Issues

**"Database connection failed"**
- Check MySQL is running
- Verify credentials in `database.php`
- Check database exists: `SHOW DATABASES;`

**"Cannot find database.php"**
- Check file paths
- Ensure files are in correct directories

**"Headers already sent"**
- Check for output before headers
- Remove any whitespace before `<?php`

### Node.js Issues

**"Cannot find module"**
```bash
npm install
```

**"ECONNREFUSED"**
- Check MySQL is running
- Verify DB credentials in `.env`

**"Port already in use"**
```bash
# Change PORT in .env or kill process:
lsof -ti:3000 | xargs kill
```

## Development Tips

1. **Use Postman** or similar tool for API testing
2. **Enable error logging** during development
3. **Use database transactions** for complex operations
4. **Implement rate limiting** to prevent abuse
5. **Keep dependencies updated** for security patches

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [PHP PDO Documentation](https://www.php.net/manual/en/book.pdo.php)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT Introduction](https://jwt.io/introduction)

## Support

For issues or questions:
1. Check `QUICK_START.md` for setup help
2. Check `DATABASE_SETUP.md` for database details
3. Review error logs in Apache/Node.js console
4. Check browser console for frontend errors
