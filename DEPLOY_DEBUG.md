# Railway Crash Debug Guide

## 1. Get the crash logs

1. Go to **Railway** → Your Project → **Deployments**
2. Click the **latest deployment**
3. Click **View Logs** or **Deploy Logs**
4. Scroll to the **bottom** – the crash error is usually there
5. Copy the last 50-100 lines and check for:
   - `Error:`
   - `EADDRINUSE` (port conflict)
   - `Cannot find module`
   - `MongoDB connection error`
   - `server.js not found`
   - `ECONNREFUSED`

## 2. Verify Railway Variables

In Railway → **Variables**, confirm these exist:

| Variable | Value |
|----------|-------|
| MONGODB_URI | Your connection string from MongoDB Atlas (never commit to git) |
| MONGODB_DB | `BizBranches` |
| NEXT_PUBLIC_BACKEND_URL | `http://localhost:3002` |

## 3. MongoDB Atlas Network Access

1. Atlas → **Network Access**
2. Add IP: **0.0.0.0/0** (Allow from anywhere)
3. Save

## 4. Try frontend-only (test)

If it keeps crashing, we can run **only the frontend** to test. The site will load but API/data won't work. Reply with "run frontend only" and we'll update the config.
