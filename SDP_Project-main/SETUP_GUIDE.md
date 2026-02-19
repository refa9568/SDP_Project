# ParadeOps - Complete Setup Guide

## 🎯 Project Architecture

```
Frontend (Port 8000) → Backend API (Port 5000) → MongoDB (Local or Cloud)
```

---

## 📋 Prerequisites

1. **Node.js** - v14 or higher
2. **MongoDB** - Local installation or MongoDB Atlas (cloud)
3. **npm** - Comes with Node.js

---

## 🔧 Step 1: MongoDB Setup

### Option A: Local MongoDB Installation
```powershell
# Windows: Download from https://www.mongodb.com/try/download/community
# After installation, MongoDB runs on port 27017
# Start MongoDB service (if not auto-starting):
net start MongoDB

# Or start mongod directly:
mongod --dbpath "C:\data\db"
```

### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/paradeops_db`

---

## 🚀 Step 2: Backend Setup

### 2.1 Install Dependencies
```powershell
cd backend
npm install
```

### 2.2 Configure Environment Variables

The `.env` file is already configured:
```env
# Backend Configuration
PORT=5000
NODE_ENV=development

# MongoDB - Use LOCAL by default
MONGODB_URI=mongodb://localhost:27017/paradeops_db

# For MongoDB Atlas, replace with:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/paradeops_db

JWT_SECRET=paradeops_secret_key_2026_change_in_production
JWT_EXPIRE=24h

CORS_ORIGIN=http://localhost:8000
```

### 2.3 Start Backend Server
```powershell
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Expected output:
# ParadeOps Backend Server running on port 5000
# ✓ MongoDB connected successfully
# Health check: http://localhost:5000/health
```

---

## 💻 Step 3: Frontend Setup

### 3.1 Set Up Local Web Server

The frontend is static HTML/CSS/JS. You need a simple HTTP server:

**Option A: Using Python (if installed)**
```powershell
cd frontend
python -m http.server 8000

# Access at: http://localhost:8000
```

**Option B: Using Node.js**
```powershell
npm install -g http-server
cd frontend
http-server -p 8000

# Access at: http://localhost:8000
```

**Option C: Using VS Code Live Server Extension**
- Right-click on login.html → "Open with Live Server"
- Usually runs on port 5500

### 3.2 Login Page Configuration

Both login pages are pre-configured to connect to backend:
- **Root login:** `login.html` (simpler, auto-detects role)
- **Frontend login:** `frontend/login.html` (role selector)

API endpoint: `http://localhost:5000/api/auth/login`

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify` - Verify token (requires auth)
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (admin/adjutant only)
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin/adjutant only)

### Leaves
- `GET /api/leaves` - Get all leaves
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id/status` - Update leave status
- `GET /api/leaves/balance` - Get leave balance

### Equipment
- `GET /api/equipment` - Get all equipment
- `POST /api/equipment` - Create equipment
- `PUT /api/equipment/:id` - Update equipment

---

## ✅ Verification Checklist

### 1. Database Connection
```powershell
# Test API health endpoint
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2026-01-19T..."}
```

### 2. Login Flow
1. Open `http://localhost:8000/login.html` (or frontend/login.html)
2. Enter a registered user's credentials
3. Should redirect to appropriate dashboard

### 3. User Data Update
```powershell
# Test user update endpoint
$token = "YOUR_JWT_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    "name" = "Updated Name"
    "email" = "new@email.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/users/USER_ID" `
    -Method PUT `
    -Headers $headers `
    -Body $body
```

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Failed
**Solution:**
- Ensure MongoDB service is running
- Check connection string in `.env`
- Verify MongoDB is listening on port 27017
- For Atlas, check whitelist IP and credentials

### Issue: CORS Error in Browser
**Solution:**
- Ensure backend CORS_ORIGIN matches frontend origin
- Check `.env`: `CORS_ORIGIN=http://localhost:8000`
- Restart backend after `.env` changes

### Issue: Login Fails (Invalid Credentials)
**Solution:**
- Check user exists in database: `db.users.find()`
- Verify password hash is set
- Check user role matches dashboard route

### Issue: Frontend Can't Connect to Backend
**Solution:**
- Verify backend is running: `curl http://localhost:5000/health`
- Check frontend API_BASE URL matches backend port
- Ensure firewall allows port 5000

---

## 📁 Project Structure

```
SDP_Project-main/
├── backend/
│   ├── src/
│   │   ├── server.js (Main server)
│   │   ├── controllers/ (Business logic)
│   │   ├── models/ (MongoDB schemas)
│   │   ├── routes/ (API endpoints)
│   │   └── middleware/ (Auth, validation)
│   ├── database/
│   │   └── database.js (MongoDB connection)
│   ├── package.json (Dependencies)
│   └── .env (Configuration)
│
├── frontend/
│   ├── login.html (Login page - role selector)
│   ├── user-registration.html (Register page)
│   ├── soldier/ (Soldier dashboards)
│   ├── coy_commander/ (Company Commander dashboards)
│   ├── adjutant/ (Adjutant dashboards)
│   ├── bsm/ (BSM dashboards)
│   └── CO/ (Commanding Officer dashboards)
│
├── login.html (Alternative login - auto-detect role)
└── serve.ps1 (PowerShell startup script)
```

---

## 🚀 Quick Start Commands

```powershell
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
python -m http.server 8000

# Terminal 3: (Optional) Monitor MongoDB
mongosh
# Then: use paradeops_db
```

---

## 🔐 Security Notes

⚠️ **Before Production:**
1. Change JWT_SECRET in `.env`
2. Change MongoDB password
3. Set NODE_ENV to production
4. Update CORS_ORIGIN to your domain
5. Use HTTPS
6. Store credentials securely (use AWS Secrets Manager, etc.)

---

## 📞 Support

**API Documentation:** Check each controller file for detailed endpoint descriptions
**Database Schema:** Check models/ folder for Mongoose schemas
**Frontend Configuration:** Check API_BASE in each HTML file

---

**Last Updated:** January 19, 2026
