# ParadeOps Integration Testing Guide

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Port 8000)                 │
│  - login.html                                           │
│  - user-registration.html                               │
│  - Dashboard pages (soldier/, coy_commander/, etc.)     │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP/REST API
                     │ http://localhost:5000
                     │
┌────────────────────▼────────────────────────────────────┐
│                  BACKEND (Port 5000)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Express Server                                   │  │
│  │  - CORS enabled for localhost:8000               │  │
│  │  - JWT Authentication                            │  │
│  │  - Request logging                               │  │
│  └───────────────────────────────────────────────────┘  │
│                     │                                    │
│  ┌──────────────────┼──────────────────────────────┐   │
│  │  API Routes      │                              │   │
│  │  /api/auth       │                              │   │
│  │  /api/users      │                              │   │
│  │  /api/leaves     │                              │   │
│  │  /api/equipment  │                              │   │
│  └──────────────────┼──────────────────────────────┘   │
│                     │                                    │
│  ┌──────────────────┼──────────────────────────────┐   │
│  │  Mongoose        │                              │   │
│  │  Models/Schemas  │                              │   │
│  │  - User          │                              │   │
│  │  - Leave         │                              │   │
│  │  - Equipment     │                              │   │
│  └──────────────────┼──────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ MongoDB Protocol
                     │
┌────────────────────▼────────────────────────────────────┐
│            MONGODB DATABASE (Port 27017)                │
│  Database: paradeops_db                                 │
│  Collections:                                           │
│  - users (authentication & profiles)                    │
│  - leaves (leave requests & approvals)                  │
│  - equipment (military equipment inventory)             │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Integration Test Cases

### Test 1: Backend Server Start-up
**Objective:** Verify backend starts with MongoDB connection

**Steps:**
```powershell
cd backend
npm run dev
```

**Expected Output:**
```
ParadeOps Backend Server running on port 5000
✓ MongoDB connected successfully
Health check: http://localhost:5000/health
```

**Pass/Fail:** ___________

---

### Test 2: Health Check Endpoint
**Objective:** Verify backend is responding to requests

**Command:**
```powershell
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-19T10:30:45.123Z"
}
```

**Pass/Fail:** ___________

---

### Test 3: Frontend Server Start-up
**Objective:** Verify frontend server starts and serves static files

**Command:**
```powershell
cd frontend
python -m http.server 8000
# OR
http-server -p 8000
```

**Expected Output:**
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/)
```

**Pass/Fail:** ___________

---

### Test 4: Frontend Login Page Load
**Objective:** Verify frontend can load login page

**Steps:**
1. Open browser
2. Navigate to `http://localhost:8000/login.html`
3. Verify page loads without errors

**Expected:**
- Login form displays
- Service Number input field visible
- Password input field visible
- Login button visible
- No console errors

**Pass/Fail:** ___________

---

### Test 5: User Registration
**Objective:** Test new user registration

**Command:**
```powershell
$body = @{
    "service_number" = "BA-12345"
    "name" = "John Soldier"
    "rank" = "Private"
    "role" = "soldier"
    "password" = "SecurePassword123"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/auth/register `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "user_id": "...",
    "service_number": "BA-12345",
    "name": "John Soldier",
    "rank": "Private",
    "role": "soldier"
  }
}
```

**Pass/Fail:** ___________

---

### Test 6: User Login
**Objective:** Test user authentication

**Command:**
```powershell
$body = @{
    "service_number" = "BA-12345"
    "password" = "SecurePassword123"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/auth/login `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "user_id": "...",
    "service_number": "BA-12345",
    "name": "John Soldier",
    "role": "soldier"
  }
}
```

**Token obtained:** ___________

**Pass/Fail:** ___________

---

### Test 7: Get Current User
**Objective:** Test authenticated request with JWT token

**Command:**
```powershell
$token = "YOUR_TOKEN_FROM_TEST_6"
curl -X GET http://localhost:5000/api/auth/verify `
    -Headers @{"Authorization"="Bearer $token"}
```

**Expected Response:**
```json
{
  "user_id": "...",
  "service_number": "BA-12345",
  "name": "John Soldier",
  "role": "soldier"
}
```

**Pass/Fail:** ___________

---

### Test 8: Update User Data
**Objective:** Test user data update functionality

**Command:**
```powershell
$token = "YOUR_TOKEN"
$userId = "YOUR_USER_ID"
$body = @{
    "email" = "john@example.com"
    "phone" = "+91-9876543210"
} | ConvertTo-Json

curl -X PUT http://localhost:5000/api/users/$userId `
    -Headers @{
        "Authorization"="Bearer $token"
        "Content-Type"="application/json"
    } `
    -Body $body
```

**Expected Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "service_number": "BA-12345",
    "name": "John Soldier",
    "email": "john@example.com",
    "phone": "+91-9876543210"
  }
}
```

**Pass/Fail:** ___________

---

### Test 9: Frontend Login Form Submission
**Objective:** Test end-to-end login flow from UI

**Steps:**
1. Open `http://localhost:8000/login.html` (or `http://localhost:8000/frontend/login.html`)
2. Enter Service Number: `BA-12345`
3. Enter Password: `SecurePassword123`
4. Click Login

**Expected:**
- No browser console errors
- Redirects to appropriate dashboard
- Token stored in localStorage
- User data stored in localStorage

**Verification (Open Browser Console):**
```javascript
localStorage.getItem('token')    // Should return JWT token
localStorage.getItem('user')     // Should return user object
```

**Pass/Fail:** ___________

---

### Test 10: CORS Validation
**Objective:** Verify CORS is properly configured

**Test from different origins:**
- Frontend origin: `http://localhost:8000` ✓ (should work)
- Another origin: `http://localhost:3000` ✗ (should fail)

**Expected Behavior:**
- Requests from localhost:8000 are allowed
- Requests from other origins are blocked

**Pass/Fail:** ___________

---

## 🔄 Integration Workflow Test

### Complete User Journey
1. **Registration** → User registers as soldier
2. **Login** → User logs in from frontend
3. **Dashboard** → User redirected to soldier dashboard
4. **Leave Application** → User applies for leave
5. **Leave Approval** → Adjutant approves/rejects leave
6. **Data Update** → Admin updates user profile

**Overall Test Result:** PASS / FAIL ___________

---

## 🐛 Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| MongoDB Connection Failed | Backend exits with error | Start MongoDB or configure Atlas in .env |
| CORS Error in Browser | Request blocked | Check CORS_ORIGIN in .env matches frontend URL |
| 404 Route Not Found | API endpoint not found | Check route registration in server.js |
| JWT Token Expired | 403 Forbidden | Token expires in 24h, user needs to re-login |
| Cannot connect to backend | ERR_CONNECTION_REFUSED | Verify backend is running on port 5000 |
| Frontend can't load | Cannot access localhost:8000 | Start frontend server on port 8000 |

---

## 📊 Test Summary

Total Tests: _____ / 10

Passed: _____
Failed: _____
Warnings: _____

**Overall Integration Status:** 
- [ ] FULLY INTEGRATED ✓
- [ ] PARTIALLY INTEGRATED ⚠
- [ ] NOT INTEGRATED ✗

---

**Date:** _________________
**Tested By:** _________________
**Notes:** ___________________________________________________________________
__________________________________________________________________________
__________________________________________________________________________

