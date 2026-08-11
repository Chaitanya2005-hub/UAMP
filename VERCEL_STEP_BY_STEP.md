# How to Create Vercel Projects Without Errors

## Step-by-Step Guide to Deploy UAMP to Vercel

### Prerequisites (Do These First)
1. ✅ Make sure your code is pushed to GitHub: `https://github.com/Chaitanya2005-hub/UAMP`
2. ✅ Have your Neon Database URL ready
3. ✅ Have a Vercel account (free at vercel.com)

---

## Part 1: Deploy Backend First

### Step 1: Go to Vercel
1. Open [https://vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Add New..." → "Project"

### Step 2: Import Repository
1. Click "Import" on your `UAMP` repository
2. Wait for Vercel to analyze the project

### Step 3: Configure Backend Project (IMPORTANT!)

**Project Settings:**
- **Project Name**: `uamp-backend` (or your preferred name)
- **Framework Preset**: Select "Other" (this is crucial!)
- **Root Directory**: Type `server` (not `/server`, just `server`)
- **Build Command**: Leave this EMPTY (Node.js doesn't need building)
- **Output Directory**: Leave this EMPTY

**⚠️ Common Mistake to Avoid:**
- ❌ Don't select "Angular" as framework (that's for frontend)
- ❌ Don't leave Root Directory empty
- ❌ Don't add build commands for Node.js backend

### Step 4: Add Environment Variables

Click "Environment Variables" and add these one by one:

**Required Variables:**
```
NEON_DATABASE_URL = postgresql://your_neon_url_here
JWT_SECRET = your_secret_key_here
JWT_EXPIRES_IN = 7d
CORS_ORIGIN = https://uamp-frontend.vercel.app
PORT = 3000
NODE_ENV = production
```

**Optional Variables (if using S3):**
```
AWS_ENDPOINT_URL_S3 = your_s3_endpoint
AWS_ACCESS_KEY_ID = your_access_key
AWS_SECRET_ACCESS_KEY = your_secret_key
AWS_REGION = us-east-2
S3_BUCKET_NAME = uamp-exam-storage
```

**💡 Tip:** For CORS_ORIGIN, use `*` during testing, then update to specific URL after frontend deployment.

### Step 5: Deploy Backend
1. Click "Deploy" button
2. Wait for deployment to complete (1-2 minutes)
3. Copy the backend URL (e.g., `https://uamp-backend.vercel.app`)
4. Test it: Open `https://uamp-backend.vercel.app/api/health` in browser

**✅ Success Criteria:**
- Deployment shows "Ready" status
- Health check returns `{"status":"healthy"}`

---

## Part 2: Deploy Frontend

### Step 1: Create New Vercel Project
1. Go back to Vercel dashboard
2. Click "Add New..." → "Project"
3. Import the same `UAMP` repository

### Step 2: Configure Frontend Project (IMPORTANT!)

**Project Settings:**
- **Project Name**: `uamp-frontend` (or your preferred name)
- **Framework Preset**: Select "Other" (Angular preset can cause issues)
- **Root Directory**: Type `uamp-angular` (not `/uamp-angular`)
- **Build Command**: Type `npm run vercel-build`
- **Output Directory**: Type `dist/uamp-angular`

**⚠️ Common Mistake to Avoid:**
- ❌ Don't select "Angular" framework (can cause build errors)
- ❌ Don't use `ng build` directly (use `npm run vercel-build`)
- ❌ Don't forget the output directory

### Step 3: Add Environment Variables

Add these environment variables:

```
API_BASE_URL = https://uamp-backend.vercel.app/api
WEBSOCKET_URL = wss://uamp-backend.vercel.app/ws
```

**💡 Important:** Replace `uamp-backend.vercel.app` with your actual backend URL from Part 1.

### Step 4: Deploy Frontend
1. Click "Deploy" button
2. Wait for deployment to complete (2-3 minutes, Angular takes longer)
3. Copy the frontend URL (e.g., `https://uamp-frontend.vercel.app`)
4. Test it: Open the URL in browser

**✅ Success Criteria:**
- Deployment shows "Ready" status
- Frontend loads without errors
- Login page appears

---

## Part 3: Update Backend CORS

### Step 1: Go to Backend Project
1. Go to Vercel dashboard
2. Select your `uamp-backend` project
3. Go to "Settings" → "Environment Variables"

### Step 2: Update CORS Origin
1. Find `CORS_ORIGIN` variable
2. Change it to your actual frontend URL:
```
CORS_ORIGIN = https://uamp-frontend.vercel.app
```
3. Click "Save"

### Step 3: Redeploy Backend
1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Select "Redeploy"
4. Wait for redeployment to complete

---

## Part 4: Test the Complete Deployment

### Test 1: Backend Health
```bash
curl https://uamp-backend.vercel.app/api/health
```
Should return: `{"status":"healthy","database":"connected"}`

### Test 2: Login API
```bash
curl -X POST https://uamp-backend.vercel.app/api/auth/login \
  -H "Content-Type" "application/json" \
  -d '{"email":"admin@uamp.edu","password":"admin123"}'
```
Should return: `{"accessToken":"...","user":{...}}`

### Test 3: Frontend Load
1. Open `https://uamp-frontend.vercel.app` in browser
2. Should see login page
3. Try logging in with admin credentials

### Test 4: Multi-Browser Test
1. Open frontend URL in Chrome → Login as admin
2. Open frontend URL in Firefox → Login as teacher
3. Open frontend URL in Edge → Login as student

---

## Common Errors and Solutions

### Error 1: "ng: command not found"
**Solution:** ✅ Already fixed in our configuration
- We added `vercel-build` script in package.json
- Build command is `npm run vercel-build`, not `ng build`

### Error 2: "Cannot find module"
**Solution:**
- Make sure Root Directory is set correctly
- Backend: `server`
- Frontend: `uamp-angular`

### Error 3: CORS errors in browser
**Solution:**
- Update CORS_ORIGIN in backend environment variables
- Make sure it includes your frontend URL
- Redeploy backend after changes

### Error 4: Build timeout
**Solution:**
- Angular builds can take 2-3 minutes
- Increase timeout in Vercel settings if needed
- Make sure `node_modules` are properly installed

### Error 5: Database connection failed
**Solution:**
- Verify NEON_DATABASE_URL is correct
- Check Neon project is active
- Ensure SSL mode is enabled in connection string

### Error 6: WebSocket connection failed
**Solution:**
- Ensure WebSocket URL uses `wss://` for HTTPS
- Check that backend WebSocket server is running
- Verify firewall allows WebSocket connections

---

## Quick Checklist Before Deployment

### Backend Deployment:
- [ ] Root Directory: `server`
- [ ] Framework: Other
- [ ] Build Command: Empty
- [ ] NEON_DATABASE_URL: Set correctly
- [ ] JWT_SECRET: Set correctly
- [ ] CORS_ORIGIN: Set (can use `*` initially)
- [ ] PORT: 3000

### Frontend Deployment:
- [ ] Root Directory: `uamp-angular`
- [ ] Framework: Other
- [ ] Build Command: `npm run vercel-build`
- [ ] Output Directory: `dist/uamp-angular`
- [ ] API_BASE_URL: Backend URL + `/api`
- [ ] WEBSOCKET_URL: Backend URL + `/ws` (with `wss://`)

### Post-Deployment:
- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Login works correctly
- [ ] CORS errors resolved
- [ ] Multi-browser login works

---

## What to Do If You Still Get Errors

### 1. Check Vercel Logs
- Go to your project in Vercel
- Click on the deployment
- Check "Build Logs" and "Function Logs"
- Look for specific error messages

### 2. Verify Configuration Files
Make sure these files exist in your repository:
- `server/vercel.json`
- `uamp-angular/vercel.json`
- `uamp-angular/package.json` (with vercel-build script)

### 3. Test Locally First
```bash
# Test frontend build locally
cd uamp-angular
npm run vercel-build

# Check if dist/uamp-angular folder is created
```

### 4. Use Vercel CLI (Alternative)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd server
vercel

# Deploy frontend
cd ../uamp-angular
vercel
```

---

## Summary: The Golden Rules

1. **Always deploy backend first**
2. **Use "Other" as framework preset**
3. **Set Root Directory correctly** (`server` or `uamp-angular`)
4. **Use `npm run vercel-build` for frontend**
5. **Add all environment variables**
6. **Update CORS after frontend deployment**
7. **Test backend health before frontend**
8. **Use correct WebSocket protocol** (`wss://` for HTTPS)

Follow these steps exactly and you should have a successful Vercel deployment without errors!
