#!/bin/sh
set -e

# Start backend on 3002 in background (so frontend can use Railway's PORT)
PORT=3002 npm run start:backend &
sleep 3

# Start frontend - must bind to Railway's PORT
cd frontend
if [ -f .next/standalone/server.js ]; then
  cd .next/standalone && exec HOSTNAME=0.0.0.0 node server.js
elif [ -f .next/standalone/bizbranches/server.js ]; then
  cd .next/standalone/bizbranches && exec HOSTNAME=0.0.0.0 node server.js
else
  echo "ERROR: server.js not found"
  find .next/standalone -name "server.js" 2>/dev/null || true
  exit 1
fi
