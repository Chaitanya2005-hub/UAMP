# UAMP Cloud Deployment Guide

## Overview
This guide will help you deploy the UAMP (University Assessment Management Portal) to Render cloud platform for production-like testing from multiple browsers and devices.

## Prerequisites
- Render account (free tier available)
- GitHub account
- Neon PostgreSQL database (you already have this)
- Domain name (optional, Render provides free subdomain)

## Step 1: Prepare Your Project

### 1.1 Create GitHub Repository
```bash
cd E:\UAMP
git init
git add .
git commit -m "Initial commit for deployment"
# Create repository on GitHub and connect it
git remote add origin https://github.com/YOUR_USERNAME/uamp.git
git push -u origin main
```

### 1.2 Update Environment Configuration
Update `E:\UAMP\uamp-angular\src\environments\environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://YOUR-RENDER-BACKEND-URL.onrender.com/api',
  websocketUrl: 'wss://YOUR-RENDER-BACKEND-URL.onrender.com/ws',
};
```

## Step 2: Deploy Backend to Render

### 2.1 Create Render Service
1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

**Build & Deploy Settings:**
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `node src/index.js`

**Environment Variables:**
```
NEON_DATABASE_URL=your_neon_database_url
JWT_SECRET=your_secure_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://YOUR-RENDER-FRONTEND-URL.onrender.com
PORT=3000
NODE_ENV=production
```

### 2.2 Backend render.yaml (Alternative)
Create `E:\UAMP\server\render.yaml`:
```yaml
services:
  - type: web
    name: uamp-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node src/index.js
    envVars:
      - key: NEON_DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generate: true
      - key: JWT_EXPIRES_IN
        value: 7d
      - key: CORS_ORIGIN
        value: https://uamp-frontend.onrender.com
      - key: PORT
        value: 3000
      - key: NODE_ENV
        value: production
```

## Step 3: Deploy Frontend to Render

### 3.1 Build Frontend for Production
```bash
cd E:\UAMP\uamp-angular
npm run build
```

### 3.2 Create Static Site Service
1. Go to Render → "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:

**Build & Deploy Settings:**
- **Root Directory**: `uamp-angular`
- **Build Command**: `ng build --configuration production`
- **Publish Directory**: `dist/uamp-angular`

**Environment Variables (if needed):**
```
API_BASE_URL=https://YOUR-RENDER-BACKEND-URL.onrender.com/api
WEBSOCKET_URL=wss://YOUR-RENDER-BACKEND-URL.onrender.com/ws
```

### 3.3 Frontend render.yaml
Create `E:\UAMP\uamp-angular\render.yaml`:
```yaml
services:
  - type: web
    name: uamp-frontend
    env: static
    plan: free
    buildCommand: npm run build
    publishDirectory: dist/uamp-angular
    envVars:
      - key: API_BASE_URL
        value: https://uamp-backend.onrender.com/api
      - key: WEBSOCKET_URL
        value: wss://uamp-backend.onrender.com/ws
```

## Step 4: Update CORS Configuration

Update `E:\UAMP\server\src\index.js` CORS settings:
```javascript
// Find this line and update it:
app.use(cors({
  origin: [
    'https://uamp-frontend.onrender.com', // Your Render frontend URL
    'http://localhost:4200',
    'http://localhost:4201',
    'http://localhost:4202'
  ],
  credentials: true
}));
```

## Step 5: Test Your Deployment

### 5.1 Backend Testing
```bash
# Test backend health
curl https://YOUR-RENDER-BACKEND.onrender.com/api/health

# Test login
curl -X POST https://YOUR-RENDER-BACKEND.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uamp.edu","password":"admin123"}'
```

### 5.2 Frontend Testing
1. Open your Render frontend URL in Chrome
2. Login as admin: `admin@uamp.edu` / `admin123`
3. Open same URL in Firefox
4. Login as teacher: `teacher@uamp.edu` / `teacher123`
5. Open same URL in Edge
6. Login as student: `student@uamp.edu` / `student123`

### 5.3 Mobile Testing
- Open the frontend URL on your phone
- Test responsive design
- Test login with different accounts

## Step 6: Monitor and Troubleshoot

### 6.1 Render Dashboard
- Monitor logs in Render dashboard
- Check resource usage
- View deployment history

### 6.2 Common Issues
- **CORS errors**: Update CORS origin in backend
- **Database connection**: Verify NEON_DATABASE_URL
- **WebSocket issues**: Ensure WebSocket URL uses `wss://` for HTTPS

## Step 7: Domain Configuration (Optional)

### 7.1 Custom Domain
1. Purchase domain or use subdomain
2. Add custom domain in Render dashboard
3. Update DNS records as instructed by Render
4. Update CORS configuration with new domain

## Benefits of Cloud Deployment

✅ **Real Production Environment**: Test exactly as users would experience it
✅ **Multi-Device Testing**: Test from phones, tablets, different browsers
✅ **Remote Access**: Share URL with stakeholders for testing
✅ **SSL/HTTPS**: Automatic SSL certificates from Render
✅ **Scalability**: Can handle multiple concurrent users
✅ **Monitoring**: Built-in logs and metrics

## Free Tier Limits (Render)

- **Web Services**: 750 hours/month
- **Static Sites**: Unlimited
- **Database**: Not needed (using Neon PostgreSQL)
- **Build Time**: 15 minutes per build
- **Bandwidth**: 100 GB/month

## Next Steps After Deployment

1. **Test all features** from different browsers
2. **Test live proctoring** with WebRTC
3. **Test file uploads** for question papers
4. **Test notifications** system
5. **Test exam creation** and scheduling
6. **Test student exam taking** workflow

## Alternative Cloud Platforms

If Render doesn't work for you, consider:
- **Railway**: Similar to Render, good for Node.js apps
- **Vercel**: Excellent for frontend, limited backend
- **Heroku**: Established platform, limited free tier
- **DigitalOcean App Platform**: More configuration options

## Support

For issues with:
- **Render**: https://render.com/docs
- **Neon Database**: https://neon.tech/docs
- **UAMP Application**: Check this repository's issues
