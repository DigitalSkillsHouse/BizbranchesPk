# Railway Deployment Troubleshooting Guide

## ✅ Configuration Summary

Your project is configured for Railway with:
- ✅ Standalone mode enabled (optimal for Railway)
- ✅ Smart server startup script (`start-server.js`)
- ✅ Proper port and hostname configuration
- ✅ Health check endpoint at `/health`

## 🔍 Common Issues & Solutions

### Issue 1: Build Succeeds But Website Not Showing

#### Check 1: Verify Build Logs
1. Go to Railway Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check the build logs for:
   - ✅ `npm run build` completes successfully
   - ✅ `.next/standalone` directory is created
   - ❌ Any errors about missing dependencies

#### Check 2: Verify Server Logs
1. Go to Railway Dashboard → Your Project → Metrics/Logs
2. Look for server startup messages:
   - Should see: `✓ Using standalone server (production mode)`
   - Should see: `Server is ready and listening`
   - ❌ Any errors about missing files or ports

#### Check 3: Test Health Endpoint
Try accessing: `https://your-railway-domain.up.railway.app/health`
- Should return: `{"status":"ok","timestamp":"...","uptime":...}`
- If this works, the server is running but routing might be the issue

### Issue 2: Blank Page or 404 Errors

#### Solution A: Check Environment Variables
1. Go to Railway Dashboard → Your Project → Variables
2. Ensure these are set:
   - `NODE_ENV` = `production` (Railway sets this automatically, but verify)
   - `MONGODB_URI` = Your MongoDB connection string
   - `MONGODB_DB` = Your database name
   - `CLOUDINARY_CLOUD_NAME` = Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` = Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` = Your Cloudinary API secret

#### Solution B: Check Custom Domain Configuration
1. Go to Railway Dashboard → Your Project → Settings → Networking
2. Verify:
   - Custom domain is connected
   - DNS records are correctly configured
   - SSL certificate is issued (may take a few minutes)

### Issue 3: Server Won't Start

#### Check Startup Logs
Look for these messages in Railway logs:

**Good signs:**
```
✓ Using standalone server (production mode)
Starting: /app/.next/standalone/server.js
Server is ready and listening
```

**Bad signs:**
```
⚠ Warning: Standalone build not found, using custom server as fallback
ERROR: No server found!
```

**If you see "Standalone build not found":**
- The build might have failed silently
- Check build logs for errors
- Verify `next.config.mjs` has `output: 'standalone'` (should be automatic for Railway)

### Issue 4: Port or Hostname Issues

Railway automatically:
- ✅ Sets `PORT` environment variable
- ✅ Sets `NODE_ENV=production`
- ✅ Routes traffic to your service

Your server should:
- ✅ Listen on `0.0.0.0` (already configured in `start-server.js`)
- ✅ Use `process.env.PORT` (already configured)

## 🚀 Deployment Checklist

Before deploying, verify:

- [ ] All environment variables are set in Railway
- [ ] `railway.json` is in the project root
- [ ] `package.json` has `"start": "node start-server.js"`
- [ ] `next.config.mjs` will use standalone mode (automatic for Railway)
- [ ] MongoDB connection string is valid and accessible
- [ ] Custom domain DNS is configured (if using custom domain)

## 📋 Step-by-Step Debugging

### Step 1: Check Build
```bash
# In Railway logs, look for:
npm install
npm run build
# Should complete without errors
```

### Step 2: Check Server Startup
```bash
# In Railway logs, look for:
Next.js Server Startup
PORT: [some port number]
NODE_ENV: production
Standalone build exists: true
✓ Using standalone server (production mode)
Server is ready and listening
```

### Step 3: Test Endpoints
1. Health check: `https://your-app.up.railway.app/health`
2. Homepage: `https://your-app.up.railway.app/`
3. API route: `https://your-app.up.railway.app/api/[some-route]`

### Step 4: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for JavaScript errors
4. Go to Network tab
5. Check for failed requests (404, 500, etc.)

## 🔧 Quick Fixes

### Fix 1: Force Rebuild
1. Railway Dashboard → Your Project → Settings
2. Click "Redeploy" or trigger a new deployment
3. Watch the build logs for errors

### Fix 2: Clear Build Cache
Railway doesn't cache by default, but if issues persist:
1. Delete the deployment
2. Create a new deployment
3. This forces a fresh build

### Fix 3: Check Next.js Build Output
In Railway build logs, verify you see:
```
Creating an optimized production build
Compiled successfully
```

### Fix 4: Verify Standalone Mode
In Railway build logs, after `npm run build`, you should see:
- `.next/standalone` directory mentioned
- No errors about missing files

## 🐛 Common Error Messages

### "Standalone build not found"
**Cause**: Build didn't create `.next/standalone` directory
**Solution**: 
- Check build logs for errors
- Verify `next.config.mjs` doesn't have errors
- Ensure `NODE_ENV=production` during build

### "Port already in use"
**Cause**: Multiple processes trying to use the same port
**Solution**: 
- Railway handles this automatically
- If you see this, it's likely a configuration issue
- Check that you're not manually setting PORT

### "Cannot find module"
**Cause**: Missing dependencies or incorrect paths
**Solution**:
- Verify `package.json` has all dependencies
- Check that `npm install` completed successfully
- Ensure node_modules is not in .gitignore incorrectly

### "MongoDB connection failed"
**Cause**: Invalid connection string or network issue
**Solution**:
- Verify `MONGODB_URI` is set correctly in Railway
- Check MongoDB allows connections from Railway IPs
- Test connection string locally first

## 📞 Still Having Issues?

If the website still doesn't show after checking everything:

1. **Share Railway Logs**: Copy the full build and runtime logs
2. **Check Health Endpoint**: Does `https://your-app.up.railway.app/health` work?
3. **Test Locally**: Run `npm run build && npm start` locally to verify
4. **Check Domain**: If using custom domain, verify DNS propagation

## 🎯 Expected Behavior

When everything works correctly:

1. **Build Phase**: 
   - Dependencies install
   - Next.js builds successfully
   - Standalone directory is created

2. **Deploy Phase**:
   - Server starts using standalone mode
   - Listens on Railway-provided PORT
   - Health endpoint responds

3. **Access**:
   - Railway domain works: `https://your-app.up.railway.app`
   - Custom domain works (if configured)
   - All routes respond correctly

## 💡 Pro Tips

1. **Monitor Logs**: Keep Railway logs open during deployment
2. **Test Health First**: Always test `/health` endpoint first
3. **Check Metrics**: Railway Dashboard → Metrics shows CPU/Memory usage
4. **Use Railway CLI**: `railway logs` to stream logs in real-time
5. **Environment Variables**: Double-check all required vars are set
