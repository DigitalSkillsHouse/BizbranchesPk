# Railway 502 - Debug Checklist

Localhost works but Railway shows 502? Follow these steps.

## FIX: Port Mismatch (app shows "Ready" but still 502)

If logs show `Ready in 384ms` and `Local: http://localhost:3001` but you get 502:

**Your app listens on port 3001, but Railway's domain may be set to port 3000.**

1. Railway → Your Project → **Settings** → **Networking** (or **Domains**)
2. Find your domain (e.g. `bizbranchespk-production.up.railway.app`)
3. Set **Target port** to **3001** (must match the port in the logs)
4. Save and wait 1 minute

**OR** set `PORT=3000` in Railway Variables – then the app will use 3000 and match your domain setting.

## 1. Check the RIGHT logs

Railway has two log types:
- **Build logs** – `npm run build`, compilation (these often look "ok")
- **Deploy/Runtime logs** – when the app actually runs (this is where errors appear)

**Action:** Railway → Deployments → Click latest deployment → **Deploy Logs** or **View Logs**. Scroll to the **bottom** – that's when the app starts.

## 2. Look for our debug lines

After redeploying, you should see in the logs:
```
[start.sh] Starting...
[start.sh] PORT=3000 HOSTNAME=0.0.0.0
[start.sh] In frontend dir: /app/frontend
[start.sh] .next exists: yes
[start.sh] Launching Next.js on port 3000...
```

**If you DON'T see these** → The start script isn't running. Check if Railway is using `npm start`.

**If you see `.next exists: NO`** → Build didn't complete or output is wrong.

**If you see these but then nothing** → Next.js may be crashing silently. Share the full log.

## 3. Railway Settings to verify

- **Settings** → **Networking** → Target port: **3000** (or leave default)
- **Variables** → Ensure no variable is overriding `PORT`
- **Root Directory** – leave blank (project root)

## 4. Try Manual Deploy

Railway → **Deployments** → **Redeploy** (trigger a fresh deploy after our changes)
