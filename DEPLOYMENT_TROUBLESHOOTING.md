# Deployment Troubleshooting Guide

## Issues Fixed

### 1. **AWS Amplify Configuration**
   - **Problem**: The `amplify.yml` was configured for standalone mode, which AWS Amplify doesn't handle well by default
   - **Fix**: 
     - Updated `next.config.mjs` to conditionally use standalone mode (only for Railway, not Amplify)
     - Updated `amplify.yml` artifacts to use root directory (`.`) instead of just `.next`
     - Added `NODE_ENV=production` to ensure production mode

### 2. **Platform Detection**
   - **Problem**: Standalone mode was being used for all platforms
   - **Fix**: Added intelligent platform detection that:
     - Uses **standard Next.js build** for AWS Amplify (better compatibility)
     - Uses **standalone mode** for Railway (optimal performance)

## What to Check If Website Still Not Showing

### 1. **AWS Amplify Console Checks**

#### A. Verify Build Status
1. Go to AWS Amplify Console
2. Check the latest build - ensure it completed successfully
3. Look for any warnings or errors in the build logs

#### B. Check Domain Configuration
1. In Amplify Console → App Settings → Domain Management
2. Verify your custom domain is:
   - ✅ Properly connected
   - ✅ DNS records are correctly configured
   - ✅ SSL certificate is issued (may take a few minutes)

#### C. Verify Environment Variables
1. Go to App Settings → Environment Variables
2. Ensure all required variables are set:
   - `MONGODB_URI`
   - `MONGODB_DB`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `LEOPARDS_API_BASE_URL` (if needed)
   - `LEOPARDS_API_KEY` (if needed)
   - `LEOPARDS_API_PASSWORD` (if needed)

#### D. Check App Settings
1. Go to App Settings → General
2. Verify:
   - **Framework**: Next.js - SSR
   - **Node version**: Should be 18.x or 20.x
   - **Build settings**: Should use `amplify.yml`

### 2. **DNS Configuration**

If using a custom domain, verify DNS records:

#### For Root Domain (example.com):
```
Type: A or AAAA
Name: @
Value: [Amplify provided IP or CNAME]
```

#### For Subdomain (www.example.com):
```
Type: CNAME
Name: www
Value: [Amplify provided domain]
```

**Note**: DNS changes can take 24-48 hours to propagate globally.

### 3. **Build Logs Analysis**

Check the build logs for:
- ✅ Build completes without errors
- ✅ `npm run build` succeeds
- ✅ `.next` directory is created
- ⚠️ Any warnings about missing dependencies
- ❌ Any errors about environment variables

### 4. **Runtime Issues**

#### Check Application Logs
1. In Amplify Console → Monitoring → Logs
2. Look for:
   - Server startup errors
   - Database connection errors
   - Missing environment variable errors
   - Port binding issues

#### Test Health Endpoint
Try accessing: `https://your-domain.com/health`
- Should return: `{"status":"ok","timestamp":"...","uptime":...}`

### 5. **Common Issues & Solutions**

#### Issue: "Build succeeds but 404 on all routes"
**Solution**: 
- Verify `amplify.yml` artifacts use `baseDirectory: .`
- Ensure Next.js is detected as SSR framework in Amplify settings
- Check that `next.config.mjs` is not forcing standalone mode for Amplify

#### Issue: "White screen or blank page"
**Solution**:
- Check browser console for JavaScript errors
- Verify all environment variables are set
- Check that MongoDB connection is working
- Look for CORS or API errors in network tab

#### Issue: "Domain shows default Amplify page"
**Solution**:
- Verify domain is connected to the correct Amplify app
- Check DNS records point to Amplify
- Wait for DNS propagation (can take up to 48 hours)

#### Issue: "SSL certificate errors"
**Solution**:
- Wait for SSL certificate to be issued (usually 5-10 minutes)
- Verify domain ownership in Amplify
- Check DNS records are correct

### 6. **Force Rebuild**

If issues persist:
1. Go to Amplify Console → App → Actions → Redeploy this version
2. Or trigger a new deployment by pushing to your connected branch

### 7. **Test Locally First**

Before deploying, test the production build locally:
```bash
npm run build
npm start
```
Then visit `http://localhost:3000` to verify everything works.

## Platform-Specific Notes

### AWS Amplify
- ✅ Uses standard Next.js build (not standalone)
- ✅ Automatically handles SSR and routing
- ✅ Requires full project structure in artifacts
- ✅ Environment variables must be set in Amplify Console

### Railway
- ✅ Uses standalone mode for optimal performance
- ✅ Requires `npm start` command (already configured)
- ✅ Automatically sets PORT environment variable
- ✅ Uses `start-server.js` which handles both modes

## Next Steps

1. **Redeploy**: Push these changes and trigger a new deployment
2. **Monitor**: Watch the build logs for any new errors
3. **Verify**: Check the health endpoint after deployment
4. **Test**: Try accessing your domain after deployment completes

## Still Having Issues?

If the website still doesn't show after these fixes:
1. Share the build logs from Amplify Console
2. Share any error messages from the browser console
3. Check if `/health` endpoint works
4. Verify DNS propagation using tools like `dnschecker.org`
