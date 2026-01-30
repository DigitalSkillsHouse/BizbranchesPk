# Domain Still Showing Error - Checklist

Deployment successful, logs look ok, but bizbranches.pk shows 502? Follow these steps:

---

## Step 1: Test Railway URL First

1. Go to **Railway** → Your Project → **Settings** → **Domains**
2. Find the Railway URL (e.g. `bizbranchespk-production.up.railway.app`)
3. **Open that URL directly in your browser** (not bizbranches.pk)

**Does it load your website?**
- **YES** → App works! The problem is Cloudflare/DNS. Go to Step 2.
- **NO** → App issue. Share the error you see and the Railway logs.

---

## Step 2: Fix Cloudflare (if Railway URL works)

### A. Use DNS only (temporary test)
1. Cloudflare → **DNS** → **Records**
2. Find your CNAME for `bizbranches.pk`
3. Click the **orange cloud** to make it **grey** (DNS only, no proxy)
4. Wait 2 minutes, then visit https://bizbranches.pk

**If it works now** → The Cloudflare proxy was the issue. Go to B.
**If still fails** → Check CNAME target. Go to C.

### B. Fix SSL mode (important for Railway)
1. Cloudflare → **SSL/TLS** → Overview
2. Set to **Full** (NOT Flexible – Railway serves HTTPS)
3. Turn the cloud back to **orange** (Proxied)
4. Wait 1 min, test https://bizbranches.pk

### C. Fix CNAME target
1. Railway → **Settings** → **Domains** → Add `bizbranches.pk` if needed
2. Railway shows a target like `monorail.proxy.rlwy.net` or `xxx.up.railway.app`
3. Cloudflare DNS → Your CNAME → **Target** must match that EXACTLY
4. Save and wait 5 minutes

---

## Step 3: Add www subdomain (optional)

If `@` (root) has issues, try adding:
- **Name:** `www`
- **Target:** (same as root - Railway URL)
- **Proxy:** Orange cloud

Then test https://www.bizbranches.pk
