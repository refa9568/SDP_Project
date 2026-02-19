# Full Integration Guide: Backend, Frontend & Database

## Overview
This guide connects the entire system:
- **Backend**: Node.js/Express API (Port 5000)
- **Frontend**: Static HTML pages (Port 8000)  
- **Database**: MongoDB (Local or Cloud)

## Prerequisites
- ✓ Node.js v14+ (npm installed)
- MongoDB (Local or Cloud Atlas)
- Git (already set up)

---

## Step 1: MongoDB Setup

### Option A: Local MongoDB (Recommended for Development)
1. Download MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run on `mongodb://localhost:27017/paradeops_db`

### Option B: MongoDB Cloud Atlas (For Remote)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/paradeops_db`
4. Update `.env` in backend folder with your connection string

---

## Step 2: Start MongoDB

### Windows - Local Instance
```powershell
# MongoDB should auto-start after installation
# Verify it's running - check Services (services.msc) for MongoDB
```

### Verify Connection
```powershell
cd backend
npm install
node check-soldiers.js  # Test database connection
```

---

## Step 3: Start Backend API Server

```powershell
cd backend
npm start
```

Expected output:
```
✓ MongoDB connected successfully
Server running on port 5000
```

The backend is now accepting requests at: `http://localhost:5000`

### Available API Endpoints:
- `GET /health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/users` - List all users
- `POST /api/leaves` - Submit leave request
- `GET /api/equipment` - List equipment

---

## Step 4: Start Frontend Server

Open a new terminal:

```powershell
cd frontend
python -m http.server 8000
```

Or use Node if you prefer:
```powershell
cd frontend
npx http-server -p 8000
```

Expected output:
```
Serving HTTP on http://localhost:8000
```

---

## Step 5: Verify Full Integration

1. **Check Backend Health**
   - Open: `http://localhost:5000/health`
   - You should see: `{"status":"ok","timestamp":"..."}`

2. **Open Frontend**
   - Open: `http://localhost:8000/frontend/login.html`
   - Try logging in - it should connect to the backend

3. **Check Browser Console**
   - Press F12 to open DevTools
   - Check Console for any errors
   - Check Network tab to see API calls to `http://localhost:5000/api/...`

---

## Troubleshooting

### "MongoDB connection failed"
- Ensure MongoDB is running (services.msc)
- Check `.env` MONGODB_URI is correct
- Verify MongoDB is listening on port 27017

### "Cannot connect to localhost:5000"
- Is the backend process still running?
- Check for port conflicts: `netstat -ano | findstr :5000`
- Restart the backend

### CORS errors in browser console
- Backend already has CORS configured for `http://localhost:8000`
- Make sure frontend is accessed via `http://localhost:8000` (not `127.0.0.1:8000`)

### "API calls returning 404"
- Verify routes in `backend/src/routes/`
- Check network tab in browser DevTools to see full request URL

---

## Quick Start Script (Windows PowerShell)

Create `START_ALL_SERVICES.ps1`:

```powershell
# Start MongoDB
Start-Process mongod -WindowStyle Hidden -PassThru | Out-Null

# Wait for MongoDB
Start-Sleep -Seconds 2

# Start Backend
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start" -PassThru
Write-Host "Backend started (PID: $($backendProcess.Id))" -ForegroundColor Green

# Wait for Backend
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; python -m http.server 8000" -PassThru | Out-Null

# Open browser
Start-Sleep -Seconds 2
Start-Process "http://localhost:8000/frontend/login.html"

Write-Host "✓ All services started!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:8000" -ForegroundColor Cyan
```

---

## Architecture Flow

```
┌─────────────────┐
│  Frontend HTML  │
│ (Port 8000)     │
└────────┬────────┘
         │
         │ HTTP Requests
         │ fetch() API calls
         │ to http://localhost:5000/api/*
         │
         ▼
┌─────────────────────┐
│  Backend/Express    │
│  (Port 5000)        │
│  - Routes           │
│  - Controllers      │
│  - Middleware       │
└────────┬────────────┘
         │
         │ MongoDB Queries
         │ (Mongoose)
         │
         ▼
┌─────────────────┐
│  MongoDB        │
│  (Port 27017)   │
│  Database       │
└─────────────────┘
```

---

## Next Steps

1. Create user accounts in the system
2. Test leave requests
3. View dashboards
4. Configure reports

For any issues, check the browser console (F12) and backend logs.
