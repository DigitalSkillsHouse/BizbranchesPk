# Railway Variables - Required for BizBranches

## Fix Port Conflict (done in code)
- Backend runs on port **3002**
- Frontend uses Railway's PORT
- Set `NEXT_PUBLIC_BACKEND_URL=http://localhost:3002` in Railway

## Fix MongoDB Connection

The error `querySrv ENOTFOUND _mongodb._tcp.cluster0.xxxxx.mongodb.net` means your **MONGODB_URI has a placeholder** or wrong host.

### Get the correct URI from your friend:

1. MongoDB Atlas → Cluster → **Connect** → **Connect your application**
2. Copy the connection string (looks like: `mongodb+srv://user:pass@cluster0.abc12.mongodb.net/`)
3. Replace `cluster0.xxxxx.mongodb.net` with the **actual** cluster hostname (e.g. `cluster0.yikbs52.mongodb.net`)

### In Railway Variables, set:
```
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.ACTUAL-ID.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=bizbranches
```

### MongoDB Atlas Network Access:
- Add `0.0.0.0/0` in Atlas → Network Access so Railway can connect

## All Railway Variables
- MONGODB_URI (full connection string - no placeholders!)
- MONGODB_DB=bizbranches
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- NEXT_PUBLIC_BACKEND_URL=http://localhost:3002
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- FRONTEND_URL=https://bizbranches.pk (for CORS)
