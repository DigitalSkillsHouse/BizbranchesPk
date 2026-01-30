# Fix Cloudflare "Host Error" with Railway

If bizbranches.pk shows **"Host Error"** through Cloudflare, try these steps:

## 1. Cloudflare SSL/TLS Mode

1. Go to **Cloudflare Dashboard** → your domain → **SSL/TLS**
2. Set encryption mode to **"Flexible"** (temporarily to test)
   - Flexible = Cloudflare uses HTTPS to visitors, HTTP to your origin
   - If that works, you can try **"Full"** later

## 2. DNS in Cloudflare

1. Go to **DNS** → **Records**
2. Remove any **A records** pointing to old IPs
3. Add/update a **CNAME** record:
   - **Name:** `@` (for root) or `www`
   - **Target:** Your Railway URL (e.g. `your-app.up.railway.app`)
   - **Proxy status:** Proxied (orange cloud)

Railway gives you a URL when you add a custom domain. Use that as the CNAME target.

## 3. Railway Custom Domain

1. In **Railway** → your project → **Settings** → **Domains**
2. Click **Custom Domain**
3. Add `bizbranches.pk` and `www.bizbranches.pk`
4. Railway will show the CNAME target – copy it to Cloudflare DNS

## 4. Railway Environment Variables

In Railway → **Variables**, set:

- `NEXT_PUBLIC_BACKEND_URL=http://localhost:3002` (for API proxying)
- `MONGODB_URI` = your MongoDB connection string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## 5. Check Railway Logs

If it still fails:

1. Railway → **Deployments** → latest deployment → **View Logs**
2. Look for crashes, port errors, or missing env vars
3. Confirm both frontend and backend processes start

## 6. Cloudflare Tunnel (if DNS still fails)

Use [Cloudflare Tunnel](https://railway.com/deploy/cf-tunnel) to connect Railway to Cloudflare directly instead of public DNS.
