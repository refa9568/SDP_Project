# 🚀 ParadeOps Login Setup with Remote MongoDB

## STEP 1: Update MongoDB Connection

Your MongoDB is on another PC. Update the connection string:

### Edit File: `backend\.env`

Change this line:
```env
MONGODB_URI=mongodb://localhost:27017/paradeops_db
```

To (replace `192.168.X.X` with your other PC's IP address):
```env
MONGODB_URI=mongodb://192.168.X.X:27017/paradeops_db
```

**Example:**
```env
MONGODB_URI=mongodb://192.168.1.100:27017/paradeops_db
```

---

## STEP 2: Start Services (3 Terminals)

### Terminal 1: Start Backend
```powershell
# From project root folder
.\START_BACKEND_SIMPLE.bat
```

Expected output:
```
✓ ParadeOps Backend Server running on port 5000
✓ Health check: http://localhost:5000/health
✓ API Base: http://localhost:5000

Server ready for requests...
```

### Terminal 2: Start Frontend  
```powershell
cd frontend
npx http-server -p 8000
```

Or use:
```powershell
.\START_FRONTEND.bat
```

### Terminal 3: Verify Backend Connection
```powershell
# Wait 5 seconds, then run:
Invoke-WebRequest http://localhost:5000/health -UseBasicParsing

# Should show: {"status":"ok","timestamp":"..."}
```

---

## STEP 3: Open Login Page

```
http://localhost:8000/login.html
```

---

## STEP 4: Login with Existing User

Use the service number and password you added in MongoDB on the other PC:

**Service Number:** (whatever you set)
**Password:** (whatever you set)

Click **Login** → Should redirect to dashboard

---

## ⚠️ IMPORTANT - MongoDB Access

For remote MongoDB to work, you need:

### On the OTHER PC (where MongoDB is):

1. MongoDB must be running and accessible
2. Firewall must allow port 27017
3. MongoDB must be listening on 0.0.0.0 (not just localhost)

### Check MongoDB Connection:

```powershell
# Test connection to remote MongoDB
$mongoIP = "192.168.X.X"  # Replace with actual IP
Test-NetConnection -ComputerName $mongoIP -Port 27017
```

Should show: `TcpTestSucceeded : True`

---

## 🆘 If MongoDB Connection Fails

### Error: "Connection Refused"

**Solution on OTHER PC (MongoDB PC):**

1. Find mongod.conf file (usually in C:\Program Files\MongoDB\Server\5.0\)

2. Edit and change:
```yaml
# Before
net:
  bindIp: 127.0.0.1

# After  
net:
  bindIp: 0.0.0.0
```

3. Restart MongoDB service

4. Test again from this PC

---

## 🆘 If Still Can't Login

### Check 1: Backend is Running?
```powershell
netstat -ano | findstr :5000
```

Should show the process.

### Check 2: Frontend Can Reach Backend?

Open browser console (F12) and run:
```javascript
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.log('ERROR:', e))
```

### Check 3: User Exists in MongoDB?

On the OTHER PC, check MongoDB:
```powershell
mongosh
use paradeops_db
db.users.find()
```

Should show your user with service_number.

### Check 4: Password Correct?

Make sure you're using exactly the password from when user was created.

---

## 📋 Quick Reference

| Item | Value |
|------|-------|
| Frontend URL | http://localhost:8000/login.html |
| Backend URL | http://localhost:5000 |
| Health Check | http://localhost:5000/health |
| MongoDB IP | 192.168.X.X:27017 |
| Backend Port | 5000 |
| Frontend Port | 8000 |

---

## ✅ Success Indicators

✓ Backend terminal shows: "Server ready for requests"
✓ Frontend terminal shows: "Available on: http://127.0.0.1:8000"
✓ Login page loads without errors
✓ Can enter service number and password
✓ Click Login → Redirected to dashboard
✓ No red errors in browser console

---

## 📞 Troubleshooting Flow

1. **Is MongoDB on other PC running?**
   - Check on that PC: Is mongod process running?

2. **Can this PC reach MongoDB on other PC?**
   - Run: `Test-NetConnection 192.168.X.X -Port 27017`

3. **Is backend started?**
   - Run: `START_BACKEND_SIMPLE.bat`
   - Should see "Server ready for requests"

4. **Is frontend started?**
   - Run: `npx http-server -p 8000` in frontend folder

5. **Does login page load?**
   - Open: `http://localhost:8000/login.html`

6. **Can you login?**
   - Use service number and password from MongoDB user

---

## 💡 Pro Tips

- Keep all 3 terminals open while testing
- Check browser console (F12) for JavaScript errors
- Check backend terminal for API errors
- Both IP address and port must be correct in .env

---

**Now update the MongoDB IP in .env and try logging in!** 🎉
