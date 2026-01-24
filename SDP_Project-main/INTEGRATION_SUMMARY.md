# ParadeOps Integration - Visual Summary

## 🎯 What's Been Connected

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (HTML/CSS/JS)                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  • login.html (role selector version)                 │  │
│  │  • user-registration.html                              │  │
│  │  • soldier/soldier_dashboard.html                      │  │
│  │  • coy_commander/coy_dashboard.html                    │  │
│  │  • adjutant/adjt_dashboard.html                        │  │
│  │  • bsm/bsm-dashboard.html                              │  │
│  │  • CO/CO_dashboard.html                                │  │
│  └────────────────────────────────────────────────────────┘  │
│  Port: 8000 | Tech: HTML5, CSS3, Vanilla JavaScript         │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                    ← API Calls (JSON) →
                    
┌──────────────────────────┬─────────────────────────────────────┐
│  BACKEND (Express.js + Mongoose)                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Authentication Routes: /api/auth                      │  │
│  │  • POST /login        - Validate credentials           │  │
│  │  • POST /register     - Create new user                │  │
│  │  • POST /logout       - Clear session                  │  │
│  │  • GET /verify        - Verify JWT token               │  │
│  │                                                         │  │
│  │  User Routes: /api/users                               │  │
│  │  • GET /              - List all users                 │  │
│  │  • GET /me            - Current user profile           │  │
│  │  • GET /:id           - Get user by ID                 │  │
│  │  • PUT /:id           - Update user data               │  │
│  │                                                         │  │
│  │  Leave Routes: /api/leaves                             │  │
│  │  • GET /              - List leave requests            │  │
│  │  • POST /             - Apply for leave                │  │
│  │  • PUT /:id/status    - Approve/reject leave           │  │
│  │  • GET /balance       - Check leave balance            │  │
│  │                                                         │  │
│  │  Equipment Routes: /api/equipment                      │  │
│  │  • GET /              - List equipment                 │  │
│  │  • POST /             - Add equipment                  │  │
│  │  • PUT /:id           - Update equipment               │  │
│  │                                                         │  │
│  │  Middleware:                                           │  │
│  │  • CORS enabled for localhost:8000                    │  │
│  │  • JWT authentication                                  │  │
│  │  • Request logging                                     │  │
│  │  • Error handling                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│  Port: 5000 | Tech: Node.js, Express, JWT, Mongoose        │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                    ← MongoDB Queries →
                    
┌──────────────────────────┬─────────────────────────────────────┐
│         MONGODB DATABASE                                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Database: paradeops_db                                │  │
│  │  Collections:                                          │  │
│  │                                                         │  │
│  │  • users                                               │  │
│  │    - service_number (unique)                           │  │
│  │    - name, rank, role, company                         │  │
│  │    - email, phone                                      │  │
│  │    - password_hash                                     │  │
│  │    - timestamps (createdAt, updatedAt)                 │  │
│  │                                                         │  │
│  │  • leaves                                              │  │
│  │    - user_id, leave_type                               │  │
│  │    - start_date, end_date, days_approved              │  │
│  │    - reason, status (pending/approved/rejected)        │  │
│  │    - approved_by                                       │  │
│  │    - timestamps                                        │  │
│  │                                                         │  │
│  │  • equipment                                           │  │
│  │    - name, type, serial_number                         │  │
│  │    - assigned_to, status                               │  │
│  │    - quantity, condition                               │  │
│  │    - timestamps                                        │  │
│  │                                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│  Port: 27017 | Tech: MongoDB 4.x+, Mongoose 8.x              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Example: User Login

```
1. User enters credentials in login.html
   ↓
2. JavaScript submits form to http://localhost:5000/api/auth/login
   ↓
3. Backend receives POST request
   ↓
4. Express middleware: CORS check ✓
   ↓
5. authController.login() executes:
   - Extract service_number & password from request
   - Find user in MongoDB: db.users.findOne({service_number})
   - Verify password: bcrypt.compare(password, stored_hash)
   - Generate JWT token
   - Return token + user data
   ↓
6. Frontend receives response with token
   ↓
7. JavaScript stores in localStorage:
   - localStorage.setItem('token', jwt_token)
   - localStorage.setItem('user', user_json)
   ↓
8. Redirect to appropriate dashboard based on role
   ↓
9. Dashboard loads and uses token for authenticated requests
   ↓
10. All subsequent requests include: Authorization: Bearer {token}
```

---

## 🔄 Environment Configuration Files

### `.env` (Backend Configuration)
```ini
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/paradeops_db

# Security
JWT_SECRET=paradeops_secret_key_2026_change_in_production
JWT_EXPIRE=24h

# CORS
CORS_ORIGIN=http://localhost:8000
```

### Frontend Configuration
**In HTML files** (search for `API_BASE`):
```javascript
const API_BASE = 'http://localhost:5000';
```

---

## 🚀 Startup Sequence

```
Terminal 1: Start MongoDB
$ mongod --dbpath "C:\data\db"
│
├─ Listening on port 27017
├─ Database: paradeops_db ready
└─ Status: ✓ Connected

Terminal 2: Start Backend
$ cd backend
$ npm run dev
│
├─ Connected to MongoDB
├─ CORS enabled for http://localhost:8000
├─ Listening on port 5000
└─ Status: ✓ Ready for requests

Terminal 3: Start Frontend
$ cd frontend
$ python -m http.server 8000
│
├─ Serving files from: ./
├─ Listening on port 8000
└─ Status: ✓ Ready to serve

Browser: Open Login Page
$ http://localhost:8000/login.html
│
├─ Page loads (frontend)
├─ User enters credentials
├─ Form submits to backend API
├─ Backend validates & returns token
├─ Browser stores token
└─ Status: ✓ User authenticated
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                    │
└─────────────────────────────────────────────────────────┘

1. LOGIN PHASE
   User submits credentials
   ↓
   Backend validates service_number & password
   ↓
   bcrypt.compare() checks password hash
   ↓
   jwt.sign() creates token: {user_id, service_number, role}
   ↓
   Token returned to frontend
   ↓
   localStorage stores token

2. AUTHENTICATED REQUEST PHASE
   Frontend makes API request
   ↓
   Adds header: Authorization: Bearer {token}
   ↓
   Backend middleware: authenticateToken()
   ↓
   jwt.verify() validates token signature
   ↓
   Token payload extracted to req.user
   ↓
   Route handler executes with req.user available
   ↓
   Response returned to frontend

3. PERMISSION CHECK PHASE
   Some routes check role: authorizeRoles()
   ↓
   For adjutant/CO only routes:
   ├─ Check req.user.role
   ├─ If authorized: execute handler
   └─ If denied: return 403 Forbidden

4. LOGOUT PHASE
   Frontend clears localStorage
   ↓
   Token removed from browser
   ↓
   Subsequent requests sent without token
   ↓
   Backend returns 401 Unauthorized
   ↓
   Frontend redirects to login page
```

---

## 📝 File Modifications Made

```
✅ MODIFIED FILES:
├── backend/.env
│   └─ Updated MongoDB configuration (was MySQL)
│   
├── backend/src/server.js
│   ├─ Added userRoutes import
│   ├─ Added /api/users route registration
│   └─ Updated CORS to use env variable
│   
├── backend/src/models/User.js
│   ├─ Renamed findById to getUserById (avoid conflict)
│   ├─ Added email/phone to select fields
│   └─ Fixed updateUser return value
│   
└── backend/src/controllers/userController.js
    ├─ Fixed getUserById ID comparison
    ├─ Updated to use new method names
    └─ Return updated user in response

✅ CREATED FILES:
├── SETUP_GUIDE.md
│   └─ Comprehensive setup & troubleshooting
│   
├── INTEGRATION_TEST.md
│   └─ 10-step integration verification tests
│   
├── QUICK_START.md
│   └─ Quick reference guide
│   
├── START_BACKEND.bat
│   └─ Windows backend startup script
│   
├── START_FRONTEND.bat
│   └─ Windows frontend startup script
│   
├── START_ALL.ps1
│   └─ PowerShell all-in-one startup
│   
└── VERIFY_SETUP.bat
    └─ System integration verification
```

---

## ✨ Features Now Enabled

### Authentication ✓
- JWT-based authentication
- Secure password hashing (bcrypt)
- Token expiration (24 hours)
- Role-based access control

### User Management ✓
- User registration
- User profile viewing
- User data updating
- Role-based dashboards

### Leave Management ✓
- Apply for leave
- Approve/reject leaves
- View leave history
- Check leave balance

### Equipment Management ✓
- Register equipment
- Track equipment status
- View equipment inventory

### Role-Based Dashboards ✓
- Soldier Dashboard
- Company Commander Dashboard
- Adjutant Dashboard
- BSM Dashboard
- Commanding Officer Dashboard

### Security Features ✓
- CORS protection
- JWT token validation
- Password hashing
- Role-based authorization
- Request logging

---

## 🎯 Integration Status

| Component | Status | Details |
|-----------|--------|---------|
| Frontend | ✅ Ready | Serving on port 8000 |
| Backend | ✅ Ready | Running on port 5000 |
| MongoDB | ✅ Ready | Configured for localhost:27017 |
| API Routes | ✅ Complete | All endpoints registered |
| Authentication | ✅ Working | JWT + bcrypt implemented |
| Database Models | ✅ Complete | User, Leave, Equipment schemas |
| CORS | ✅ Configured | localhost:8000 allowed |
| Error Handling | ✅ Complete | Express middleware active |

**Overall Integration Status: ✅ FULLY INTEGRATED**

---

## 📞 Quick Reference

| What to Run | Command | Terminal | Port |
|------------|---------|----------|------|
| MongoDB | `mongod` | 1 | 27017 |
| Backend | `npm run dev` | 2 | 5000 |
| Frontend | `http-server -p 8000` | 3 | 8000 |
| Login | Open browser | - | - |

---

**Integration Completed:** January 19, 2026
**Backend, Frontend & Database:** Fully Connected ✅
