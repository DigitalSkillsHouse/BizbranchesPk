# 🚀 Railway Deployment Instructions

## Step 1: Prepare Your Project
✅ All fixes have been applied to your project:
- Railway configuration updated
- Next.js config optimized for Railway
- MongoDB connection improved
- Environment variables template created

## Step 2: Set Up Railway Environment Variables

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. Go to **Variables** tab
4. Add these environment variables:

```
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster1.xxxxx.mongodb.net/BizBranches?retryWrites=true&w=majority
MONGODB_DB=BizBranches
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002
FRONTEND_URL=https://bizbranches.pk
```

Add these in Railway → Variables. Get credentials from MongoDB Atlas and Cloudinary - never commit real credentials to GitHub.

**Important**: Update `FRONTEND_URL` with your actual Railway domain!

## Step 3: Deploy

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Railway deployment fixes"
   git push
   ```

2. **Railway will automatically deploy** when you push to your connected branch

## Step 4: Monitor Deployment

1. Go to Railway Dashboard → Your Project → **Deployments**
2. Watch the build logs for:
   - ✅ `npm ci` completes successfully
   - ✅ `npm run build` creates standalone build
   - ✅ Server starts with "✓ Using standalone server"

## Step 5: Test Your Deployment

1. **Health Check**: Visit `https://your-app.up.railway.app/health`
   - Should return: `{"status":"ok","timestamp":"...","uptime":...}`

2. **Homepage**: Visit `https://your-app.up.railway.app/`
   - Should load your website

3. **API Routes**: Test any API endpoints

## 🔧 If Something Goes Wrong

### Build Fails
- Check Railway logs for specific error messages
- Ensure all dependencies are in `package.json`
- Verify no syntax errors in code

### Server Won't Start
- Check that all environment variables are set
- Verify MongoDB connection string is correct
- Look for "standalone build exists: true" in logs

### Website Shows Blank Page
- Check browser console for JavaScript errors
- Verify all API routes are working
- Test the health endpoint first

### MongoDB Connection Issues
- Verify `MONGODB_URI` is exactly correct
- Check MongoDB Atlas allows connections from all IPs (0.0.0.0/0)
- Test connection string locally first

## 📞 Need Help?

If you're still seeing errors:

1. **Share the Railway logs** (build and runtime)
2. **Test the health endpoint**: Does `/health` work?
3. **Check browser console** for any JavaScript errors
4. **Verify environment variables** are all set correctly

## ✅ Expected Success Indicators

When deployment works correctly, you should see:

**In Railway Build Logs:**
```
✓ npm ci completed
✓ npm run build completed
✓ Creating optimized production build
✓ Compiled successfully
```

**In Railway Runtime Logs:**
```
✓ Using standalone server (production mode)
✓ Connected to MongoDB database: BizBranches
✓ Server is ready and listening
```

**In Browser:**
- Your website loads at the Railway domain
- Health endpoint returns JSON response
- All functionality works as expected

---

**Status**: Your project is now ready for Railway deployment! 🎉