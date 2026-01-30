#!/bin/sh
set -e

echo "[start.sh] Starting backend on 3002, frontend on $PORT..."

# Start backend in background (API for Next.js rewrites)
cd "$(dirname "$0")/backend"
PORT=3002 node dist/index.js &
BACKEND_PID=$!
sleep 2

# Start frontend (main process - Railway routes traffic here)
cd "$(dirname "$0")/frontend"
export HOSTNAME=0.0.0.0
export PORT="${PORT:-3000}"
export NEXT_PUBLIC_BACKEND_URL="http://localhost:3002"

echo "[start.sh] Backend PID $BACKEND_PID, launching Next.js on port $PORT..."
exec node ./node_modules/next/dist/bin/next start
