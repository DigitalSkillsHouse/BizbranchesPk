#!/bin/sh
set -e

echo "[start.sh] Starting..."
echo "[start.sh] PORT=$PORT HOSTNAME=0.0.0.0"
echo "[start.sh] PWD=$(pwd)"

cd "$(dirname "$0")/frontend"
echo "[start.sh] In frontend dir: $(pwd)"
echo "[start.sh] .next exists: $(test -d .next && echo yes || echo NO)"

# Railway sets PORT - must use it
export HOSTNAME=0.0.0.0
export PORT="${PORT:-3000}"

echo "[start.sh] Launching Next.js on port $PORT..."
exec node ./node_modules/next/dist/bin/next start
