#!/bin/sh
set -e
cd "$(dirname "$0")/frontend"

# Railway sets PORT - must use it
export HOSTNAME=0.0.0.0
: "${PORT:=3000}"

# Find server.js - Next.js may put it in standalone/ or standalone/<package-name>/
if [ -f .next/standalone/server.js ]; then
  cd .next/standalone
elif [ -f .next/standalone/bizbranches/server.js ]; then
  cd .next/standalone/bizbranches
elif [ -f .next/standalone/frontend/server.js ]; then
  cd .next/standalone/frontend
else
  echo "ERROR: server.js not found"
  find .next/standalone -name "server.js" 2>/dev/null || true
  exit 1
fi

exec node server.js
