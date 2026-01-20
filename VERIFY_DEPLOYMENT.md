# Quick Deployment Verification Checklist

Since your domain is attached to Railway and you've pushed to GitHub, follow these steps:

## ✅ Step 1: Check Deployment Status

1. Go to **Railway Dashboard** → Your Project
2. Check the **Deployments** tab
3. Look for the latest deployment:
   - ✅ **Green/Active** = Deployment successful
   - ⏳ **Building/Deploying** = Still in progress (wait a few minutes)
   - ❌ **Failed** = Check build logs for errors

## ✅ Step 2: Verify Build Logs

In the deployment logs, verify you see:

```
✓ npm install completed
✓ npm run build completed
✓ Creating .next/standalone directory
✓ Build successful
```

**If you see errors**, note them down.

## ✅ Step 3: Check Server Logs

1. Go to **Railway Dashboard** → Your Project → **Metrics/Logs**
2. Look for these messages:

**✅ Good signs:**
```
Next.js Server Startup
PORT: [number]
NODE_ENV: production
Standalone build exists: true
✓ Using standalone server (production mode)
Server is ready and listening
```

**❌ Bad signs:**
```
ERROR: No server found!
⚠ Warning: Standalone build not found
Failed to start standalone server
```

## ✅ Step 4: Test Health Endpoint

Try accessing your Railway domain:

**Option A: Railway-provided domain**
```
https://[your-app-name].up.railway.app/health
```

**Option B: Your custom domain**
```
https://yourdomain.com/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...,
  "port": ...
}
```

**If this works**: Server is running! ✅
**If this fails**: Server might not be starting correctly ❌

## ✅ Step 5: Test Homepage

Try accessing:
- Railway domain: `https://[your-app].up.railway.app/`
- Custom domain: `https://yourdomain.com/`

**What to check:**
- ✅ Page loads (even if blank, means server is responding)
- ❌ Connection timeout = Server not running
- ❌ 404 error = Routing issue
- ❌ 500 error = Application error (check logs)

## ✅ Step 6: Verify DNS (If Using Custom Domain)

1. Go to **Railway Dashboard** → Your Project → **Settings** → **Networking**
2. Check your custom domain:
   - ✅ Domain shows as "Connected"
   - ✅ SSL certificate is "Issued" (may take 5-10 minutes)
   - ❌ "Pending" = Still being set up

3. Test DNS propagation:
   - Visit: https://dnschecker.org
   - Enter your domain
   - Check if DNS records are propagated globally
   - **Note**: DNS can take 24-48 hours to fully propagate

## ✅ Step 7: Check Environment Variables

1. Go to **Railway Dashboard** → Your Project → **Variables**
2. Verify these are set:
   - ✅ `MONGODB_URI`
   - ✅ `MONGODB_DB`
   - ✅ `CLOUDINARY_CLOUD_NAME`
   - ✅ `CLOUDINARY_API_KEY`
   - ✅ `CLOUDINARY_API_SECRET`
   - ✅ Any other required variables

## 🔍 Common Issues After Push

### Issue: "Deployment still building"
**Solution**: Wait 2-5 minutes for build to complete. Railway builds can take time.

### Issue: "Build failed"
**Solution**: 
- Check build logs for specific errors
- Verify all dependencies in `package.json`
- Check for TypeScript/ESLint errors (though these are ignored in config)

### Issue: "Server not starting"
**Solution**:
- Check runtime logs in Railway
- Verify `NODE_ENV=production` is set (Railway sets this automatically)
- Check if standalone build was created (look for `.next/standalone` in build logs)

### Issue: "Health endpoint works but homepage doesn't"
**Solution**:
- This is likely a routing or application error
- Check browser console (F12) for JavaScript errors
- Check Railway logs for application errors
- Verify MongoDB connection is working

### Issue: "Custom domain shows Railway default page"
**Solution**:
- DNS might not be fully propagated
- Check DNS records in your domain registrar
- Verify domain is connected in Railway settings
- Wait for SSL certificate to be issued

### Issue: "Connection timeout"
**Solution**:
- Server might not be running
- Check Railway logs for startup errors
- Verify the service is "Active" in Railway dashboard
- Check if Railway service is paused (free tier pauses after inactivity)

## 🚀 Quick Actions

### Force Redeploy
1. Railway Dashboard → Your Project
2. Click **"Redeploy"** or **"Deploy Latest"**
3. Watch the logs

### View Real-time Logs
1. Railway Dashboard → Your Project → **Metrics/Logs**
2. Or use Railway CLI: `railway logs`

### Test Locally First
```bash
npm run build
npm start
# Then visit http://localhost:3000
```

## 📋 What to Share If Still Having Issues

If the website still doesn't work, share:

1. **Deployment Status**: Is it "Active" or "Failed"?
2. **Build Logs**: Any errors during `npm run build`?
3. **Server Logs**: What do you see when the server starts?
4. **Health Endpoint**: Does `/health` work?
5. **Browser Console**: Any JavaScript errors? (F12 → Console)
6. **Error Messages**: Any specific error messages?

## ✅ Success Indicators

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ Server logs show "Server is ready and listening"
- ✅ `/health` endpoint returns `{"status":"ok"}`
- ✅ Homepage loads (even if there are minor issues)
- ✅ Custom domain shows your website (if configured)
- ✅ SSL certificate is issued (green padlock in browser)

---

**Next Steps**: Check your Railway dashboard and follow the steps above. If you see any specific errors, share them and I'll help you fix them!
