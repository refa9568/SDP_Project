# ParadeOps Login Troubleshooting Guide

## ⚠️ Common Login Issues & Solutions

---

## Issue 1: Backend Not Running ❌

**Symptom:** Browser shows "Connection error" or "Failed to connect"

**Quick Fix:**
```powershell
# Terminal 1
cd backend
npm run dev
```

**Expected Output:**
```
ParadeOps Backend Server running on port 5000
✓ MongoDB connected successfully
```

---

## Issue 2: Database Not Connected ❌

**Symptom:** Backend starts but says "MongoDB connection failed"

**Check MongoDB is Running:**
```powershell
# Terminal 2 (or check if mongod service is running)
mongod --dbpath "C:\data\db"
```

**Expected Output:**
```
[initandlisten] waiting for connections on port 27017
```

---

## Issue 3: User Doesn't Exist ❌

**Symptom:** Login says "Invalid credentials" even with correct password

**Solution: Register First**
1. Go to: `http://localhost:8000/login.html`
2. Click: "New User? Register Here"
3. Fill in details:
   - Service Number: `BA-12345` (must be unique)
   - Name: `John Doe`
   - Rank: `Private`
   - Role: `soldier` (or other role)
4. Click: "Register"

**Note:** Default password for ALL users is **`1234`**

---

## Issue 4: Wrong Password ❌

**Important:** All users created with default password **`1234`**

**To Login:**
- Service Number: (whatever you registered)
- Password: **`1234`**

---

## Issue 5: CORS Error in Browser Console ❌

**Symptom:** Browser console shows "CORS error" or "Access-Control-Allow-Origin"

**Solution:**
1. Restart backend:
   - Press Ctrl+C in backend terminal
   - Run: `npm run dev`

2. Verify .env has:
   ```env
   CORS_ORIGIN=http://localhost:8000
   ```

---

## Issue 6: Frontend Can't Connect to Backend ❌

**Symptom:** Login form works but submit gives connection error

**Check:**
1. Backend is running on port 5000:
   ```powershell
   curl http://localhost:5000/health
   ```
   
   Expected: `{"status":"ok"}`

2. Frontend is on port 8000:
   ```powershell
   Browser: http://localhost:8000/login.html
   ```

3. Both running simultaneously in different terminals

---

## Complete Login Test Procedure ✅

### Step 1: Verify All Services Running
```powershell
# Check MongoDB
Test-NetConnection localhost -Port 27017

# Check Backend
Test-NetConnection localhost -Port 5000

# Check Frontend  
Test-NetConnection localhost -Port 8000
```

All should show: `TcpTestSucceeded: True`

### Step 2: Register Test User
```
Browser: http://localhost:8000/login.html
Click: "New User? Register Here"

Fill Form:
  Service Number: TEST-001
  Name: Test Soldier
  Rank: Private
  Role: soldier

Click: Register
Expected: Success message
```

### Step 3: Login with Test User
```
Browser: http://localhost:8000/login.html

Service Number: TEST-001
Password: 1234

Click: Login
Expected: Redirected to soldier dashboard
```

### Step 4: Verify Dashboard
```
Check: 
  ✓ Page loads without errors
  ✓ Shows soldier-specific content
  ✓ Navigation works
  ✓ No console errors
```

---

## Quick Diagnostics

### Test 1: Is Backend Running?
```powershell
curl http://localhost:5000/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### Test 2: Can Frontend Reach Backend?
```powershell
# From browser console (F12 → Console tab)
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

Expected: `{status: "ok", timestamp: "..."}`

### Test 3: Is User in Database?
```powershell
# In MongoDB shell or MongoDB Compass
use paradeops_db
db.users.find()
```

Expected: Shows registered users

### Test 4: Can You Login via API?
```powershell
$body = @{
    service_number = "TEST-001"
    password = "1234"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/auth/login `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

Expected: Returns token and user data

---

## Complete Startup Sequence

### Terminal 1: MongoDB
```powershell
mongod --dbpath "C:\data\db"
# Or check service: Get-Service MongoDB
```

### Terminal 2: Backend
```powershell
cd backend
npm install
npm run dev
```

**Wait for:** `✓ MongoDB connected successfully`

### Terminal 3: Frontend
```powershell
cd frontend
python -m http.server 8000
```

**Wait for:** `Serving HTTP on 0.0.0.0 port 8000`

### Browser
```
http://localhost:8000/login.html
```

---

## Step-by-Step Login Flow

```
1. User enters credentials in form
   ↓
2. JavaScript sends POST to http://localhost:5000/api/auth/login
   ↓
3. Backend receives request
   ├─ Checks CORS (must be from localhost:8000) ✓
   ├─ Parses JSON body ✓
   ├─ Finds user in MongoDB ✓
   ├─ Verifies password with bcrypt ✓
   ├─ Generates JWT token ✓
   └─ Returns token + user data ✓
   ↓
4. Frontend receives response
   ├─ Stores token in localStorage ✓
   ├─ Stores user data in localStorage ✓
   └─ Redirects to dashboard ✓
   ↓
5. Dashboard page loads
   └─ Uses token for authenticated requests
```

If any step fails, login stops.

---

## Error Messages & Solutions

### Error: "Connection error"
**Cause:** Backend not running
**Fix:** Start backend: `npm run dev`

### Error: "Invalid credentials"
**Cause:** User doesn't exist OR wrong password
**Fix:** Register user first, use password `1234`

### Error: "Access denied"
**Cause:** Insufficient permissions
**Fix:** Check user role, might need admin account

### Error: "CORS error"
**Cause:** Backend CORS not configured for frontend
**Fix:** Restart backend, check .env

### Error: "Cannot read property 'token'"
**Cause:** Backend didn't return token (login failed)
**Fix:** Check browser console for API error

---

## Default Credentials (All New Users)

| Field | Value |
|-------|-------|
| Password (for all new users) | `1234` |
| Service Number | Register your own |
| Name | Register your own |
| Rank | Register your own |
| Role | Register your own |

---

## Debugging Checklist

- [ ] MongoDB is running (port 27017)
- [ ] Backend is running (port 5000)
- [ ] Frontend is running (port 8000)
- [ ] User is registered in system
- [ ] Using correct service number
- [ ] Using password `1234`
- [ ] No console errors in browser (F12)
- [ ] Backend terminal shows request logs
- [ ] CORS_ORIGIN in .env is `http://localhost:8000`

---

## Where to Check for Errors

### Browser Console (F12)
- JavaScript errors
- API response errors
- Network requests

### Backend Terminal
- Login request logs
- Database queries
- Error messages

### MongoDB Connection
- Check if service is running
- Verify connection string in .env

---

## If Still Having Issues

1. **Check Backend Logs**
   - Look at terminal output for errors
   - Should show: `POST /api/auth/login`

2. **Check Browser Console**
   - Press F12 → Console tab
   - Look for red error messages
   - Check Network tab for API response

3. **Check Database**
   - MongoDB Compass (GUI tool)
   - Connect to `mongodb://localhost:27017`
   - Check `paradeops_db.users` collection

4. **Restart Everything**
   ```powershell
   Ctrl+C (in all terminals)
   mongod --dbpath "C:\data\db"        # Terminal 1
   cd backend && npm run dev            # Terminal 2
   cd frontend && python -m http.server # Terminal 3
   ```

---

## Quick Start Command

**Windows Users (All in one):**
```powershell
# Run in 3 separate terminals:
mongod --dbpath "C:\data\db"
cd backend && npm run dev
cd frontend && python -m http.server 8000
```

**Then in Browser:**
```
http://localhost:8000/login.html
```

---

**Last Updated:** January 19, 2026
