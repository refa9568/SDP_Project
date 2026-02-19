# Find Your MongoDB PC IP Address

## Method 1: On the PC Running MongoDB

Run this command:
```powershell
ipconfig
```

Look for "IPv4 Address" - should be something like:
```
192.168.1.100
192.168.0.50
10.0.0.20
```

---

## Method 2: From This PC (Quick Check)

```powershell
# Get all IPs on your network
arp -a
```

Look for the MongoDB PC's IP

---

## Method 3: Test Connection

Once you know the IP, test it:
```powershell
$IP = "192.168.1.100"  # Replace with actual IP
Test-NetConnection -ComputerName $IP -Port 27017

# If it shows: TcpTestSucceeded : True
# Then the connection works!
```

---

## Once You Have the IP:

Edit this file:
```
c:\SDP_Project-main (2)\SDP_Project-main\backend\.env
```

Change:
```env
MONGODB_URI=mongodb://YOUR_IP_HERE:27017/paradeops_db
```

Example:
```env
MONGODB_URI=mongodb://192.168.1.100:27017/paradeops_db
```

---

## Verify It Works

1. Save .env
2. Restart backend: `START_BACKEND_SIMPLE.bat`
3. Backend should show: "✓ MongoDB connected successfully"
4. Try login with user from other PC

---

**Get the IP from the other PC first, then update .env!** 🎯
