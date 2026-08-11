# Quick Local Network Deployment Guide

## Fast Setup for Multi-Browser Testing

This is the quickest way to test from multiple browsers and devices on your local network.

## Step 1: Find Your Local IP Address

```bash
# Windows
ipconfig
# Look for "IPv4 Address" (usually 192.168.x.x)
```

## Step 2: Update CORS Configuration

Update `E:\UAMP\server\src\index.js`:
```javascript
// Find the CORS configuration and update it:
app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://localhost:4201', 
    'http://localhost:4202',
    'http://YOUR_LOCAL_IP:4200',  // Add your local IP
    'http://192.168.1.100:4200'    // Example
  ],
  credentials: true
}));
```

## Step 3: Update Frontend Environment

Update `E:\UAMP\uamp-angular\src\environments\environment.ts`:
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://YOUR_LOCAL_IP:3000/api',  // Use your local IP
  websocketUrl: 'ws://YOUR_LOCAL_IP:3000/ws',
};
```

## Step 4: Start Backend Server

```bash
cd E:\UAMP\server
npm start
```

Backend will be available at: `http://YOUR_LOCAL_IP:3000`

## Step 5: Start Frontend Server

```bash
cd E:\UAMP\uamp-angular
npm start -- --host 0.0.0.0
```

Frontend will be available at: `http://YOUR_LOCAL_IP:4200`

## Step 6: Test from Different Devices

### On the Same Computer:
- **Chrome**: `http://localhost:4200` - Login as admin
- **Firefox**: `http://localhost:4200` - Login as teacher
- **Edge**: `http://localhost:4200` - Login as student

### On Other Devices on Your Network:
1. **Phone/Tablet**: Open browser → `http://YOUR_LOCAL_IP:4200`
2. **Another computer**: Open browser → `http://YOUR_LOCAL_IP:4200`
3. **Different browsers**: Use Chrome, Firefox, Safari, etc.

## Step 7: Windows Firewall Settings

If other devices can't connect, you may need to allow Node.js through Windows Firewall:

1. Open Windows Security → Firewall & network protection
2. Click "Allow an app through firewall"
3. Find "Node.js" and allow it on both private and public networks
4. Or temporarily disable firewall for testing

## Testing Checklist

✅ **Admin Access**: Create exams, approve papers, manage users
✅ **Teacher Access**: Schedule exams, upload papers, monitor students
✅ **Student Access**: Take exams, view results, check notifications
✅ **Live Proctoring**: Test video streaming between devices
✅ **File Uploads**: Test question paper uploads from different devices
✅ **Real-time Updates**: Test notifications and live monitoring

## Advantages of Local Network Deployment

✅ **Fast Setup**: No cloud account registration needed
✅ **No Latency**: Local network is faster than cloud
✅ **Free**: No costs involved
✅ **Private**: Stays within your local network
✅ **Easy Debugging**: Can see console logs directly

## Disadvantages

❌ **Not Public**: Only works on your local network
❌ **Requires Local Server**: Your computer must be running
❌ **No SSL**: HTTP instead of HTTPS
❌ **IP Changes**: Local IP may change when you restart router

## Quick Start Commands

```bash
# Terminal 1 - Backend
cd E:\UAMP\server
npm start

# Terminal 2 - Frontend  
cd E:\UAMP\uamp-angular
npm start -- --host 0.0.0.0

# On other devices, open browser:
# http://YOUR_LOCAL_IP:4200
```

## Troubleshooting

### Other devices can't connect:
1. Check firewall settings
2. Verify both servers are running
3. Ensure devices are on same network
4. Try different ports if 4200/3000 are blocked

### CORS errors:
1. Update CORS configuration with your local IP
2. Restart backend server after changes
3. Check browser console for specific error messages

### WebSocket issues:
1. Ensure WebSocket URL uses `ws://` not `wss://` for local
2. Check firewall allows WebSocket connections
3. Verify backend WebSocket server is running

## When to Use Local Network vs Cloud

**Use Local Network For:**
- Quick testing and development
- Testing with multiple browsers on same computer
- Testing with devices on your home/office network
- Debugging network issues

**Use Cloud Deployment For:**
- Testing with users outside your network
- Public demonstrations
- Production-like environment
- Remote team collaboration
- Long-term testing sessions
