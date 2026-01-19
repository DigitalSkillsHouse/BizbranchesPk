# Server Startup Issues - Analysis & Fixes

## 🔍 Issues Identified

### 1. **Primary Issue: Missing Build Artifacts**
   - **Problem**: The `start-server.js` script expected a standalone build at `.next/standalone/server.js`, but the project hasn't been built yet (no `.next` directory exists).
   - **Impact**: Running `npm start` would immediately fail with "Standalone server not found" error.
   - **Root Cause**: The startup script didn't have a fallback mechanism for when the build doesn't exist.

### 2. **Configuration Mismatch**
   - **Problem**: Two server files exist:
     - `server.js` - Custom Next.js server (works in dev and production)
     - `start-server.js` - Wrapper for standalone mode (only works after build)
   - **Impact**: Confusion about which server to use and when.

### 3. **No Development Fallback**
   - **Problem**: The start script only worked for production with a pre-built standalone server.
   - **Impact**: Developers couldn't easily start the server without building first.

## ✅ Fixes Applied

### 1. **Smart Startup Script (`start-server.js`)**
   Updated `start-server.js` to intelligently choose the right server:
   
   - **If standalone build exists AND in production**: Uses standalone server (optimal for Railway)
   - **If standalone doesn't exist OR in development**: Falls back to `server.js` (custom server)
   - **If neither exists**: Shows helpful error message with instructions

   **Benefits**:
   - Works in both development and production
   - Automatically handles missing builds
   - Provides clear error messages
   - Maintains optimal performance in production

### 2. **Server Configuration**
   - `server.js` is already well-configured with:
     - Proper error handling
     - Health check endpoint (`/health`)
     - Graceful shutdown handling
     - Request logging
     - Port validation

## 🚀 How to Start the Server

### For Development:
```bash
npm run dev
```
This uses Next.js's built-in development server with hot reloading.

### For Production (Local Testing):
```bash
# First, build the project
npm run build

# Then start the server
npm start
```

### For Production (Railway/Deployment):
The `npm start` command will automatically:
1. Check if standalone build exists
2. Use standalone server if available (faster, optimized)
3. Fall back to custom server if needed
4. Provide clear error messages if something is wrong

## 📋 Environment Variables Required

Make sure you have these environment variables set (especially for production):

### Required:
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (automatically set by Railway, defaults to 3000)

### Optional:
- `MONGODB_DB` - Database name (defaults to 'BizBranches')
- `MONGODB_PROFILE_URI` - Profile database connection (optional)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary configuration
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `NODE_ENV` - Set to 'production' for production mode

## 🔧 Troubleshooting

### Server won't start - "No server found"
**Solution**: Run `npm run build` first, or use `npm run dev` for development.

### Port already in use
**Solution**: 
- Change the PORT environment variable
- Or kill the process using the port: `lsof -ti:3000 | xargs kill` (Mac/Linux)

### MongoDB connection errors
**Solution**: 
- Verify `MONGODB_URI` is set correctly
- Check MongoDB server is accessible
- Ensure network/firewall allows connections

### Standalone build issues
**Solution**: 
- Delete `.next` directory: `rm -rf .next`
- Rebuild: `npm run build`
- Check for build errors in the console

## 📝 Notes

- The server automatically handles both development and production modes
- Health check endpoint available at `/health`
- Server logs all requests with timestamps for debugging
- Graceful shutdown on SIGTERM/SIGINT signals
- Request timeout set to 30 seconds to prevent hanging

## ✨ Improvements Made

1. ✅ Smart server selection (standalone vs custom)
2. ✅ Better error messages with actionable solutions
3. ✅ Automatic fallback to custom server when needed
4. ✅ Clear logging of which server mode is being used
5. ✅ Development-friendly startup process

---

**Status**: All server startup issues have been resolved. The server should now start successfully in both development and production environments.
