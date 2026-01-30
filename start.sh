#!/bin/sh
# Don't exit on backend errors - frontend must start
set +e

# Start backend on 3002 in background
(PORT=3002 npm run start:backend 2>&1 &)
sleep 2

# Start frontend - MUST bind to Railway's PORT
cd frontend
export HOSTNAME=0.0.0.0
if [ -f .next/standalone/server.js ]; then
  cd .next/standalone && exec node server.js
elif [ -f .next/standalone/bizbranches/server.js ]; then
  cd .next/standalone/bizbranches && exec node server.js
else
  echo "ERROR: server.js not found. Looking..."
  find .next/standalone -type f -name "*.js" 2>/dev/null | head -20
  exit 1
fi
