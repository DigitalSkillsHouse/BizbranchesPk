# Fix 502 Bad Gateway - Cloudflare + Railway

## Step 1: Test Railway URL Directly (MOST IMPORTANT)

**First, check if your app works without Cloudflare:**

1. Go to **Railway Dashboard** → Your Project → **Settings** → **Networking** or **Domains**
2. Find your **Railway URL** (e.g. `bizbranches-production.up.railway.app` or `xxxx.up.railway.app`)
3. Open that URL in your browser: `https://YOUR-RAILWAY-URL.up.railway.app`

**Result:**
- ✅ **If it works** → Your app is fine. The problem is Cloudflare ↔ Railway. Go to Step 2.
- ❌ **If it shows 502 or error** → Your app is crashing. Go to Step 4.

---

## Step 2: Fix Cloudflare DNS

Your CNAME must point to the **exact** Railway URL.

1. In **Railway** → Settings → **Domains** → Add custom domain `bizbranches.pk`
2. Railway will show: **"Add CNAME record pointing to: `xxxx.up.railway.app`"**
3. Copy that exact URL (e.g. `monorail.proxy.rlwy.net` or `xxx.up.railway.app`)

4. In **Cloudflare** → DNS → Records:
   - **Delete** your current CNAME
   - Click **Add record**
   - **Type:** CNAME
   - **Name:** `@` (for root domain)
   - **Target:** Paste the **exact** URL from Railway (e.g. `monorail.proxy.rlwy.net`)
   - **Proxy status:** Proxied (orange cloud) ✅
   - Save

5. Wait 2–5 minutes for DNS to propagate

---

## Step 3: Cloudflare SSL Settings

1. Cloudflare → **SSL/TLS**
2. Set encryption to **Flexible** (try this first)
3. If Flexible works, you can try **Full** later

---

## Step 4: If Railway URL Itself Shows 502 (App Crashing)

Your app may not be starting. Check:

1. **Railway** → Deployments → Latest → **View Logs**
2. Look for errors like:
   - `Error: Cannot find module`
   - `MongoDB connection failed`
   - `Port already in use`
   - `EADDRINUSE`

3. **Verify Railway Variables** – these must be set:
   - `MONGODB_URI` (your full connection string)
   - `MONGODB_DB` 
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_BACKEND_URL` = `http://localhost:3002`

4. **MongoDB Atlas** – In Atlas → Network Access, add `0.0.0.0/0` so Railway can connect.

---

## Step 5: Temporary Test – Bypass Cloudflare Proxy

To see if the problem is Cloudflare’s proxy:

1. Cloudflare → DNS → Your CNAME record
2. Click the **orange cloud** to turn it **grey** (DNS only)
3. Visit `https://bizbranches.pk` again

- If it works with grey cloud → Issue is Cloudflare proxy. Try SSL mode “Flexible” or “Full”.
- If it still fails → Issue is likely DNS or Railway.

---

## What to Share If You Need Help

1. Your **Railway URL** (e.g. `xxx.up.railway.app`) – does it work when you open it?
2. Screenshot of **Cloudflare DNS** records
3. **Railway deployment logs** (last 20–30 lines)
