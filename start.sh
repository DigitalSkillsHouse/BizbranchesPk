#!/bin/sh
# Start frontend - must use Railway's PORT
cd frontend
export HOSTNAME=0.0.0.0
export PORT="${PORT:-3000}"
exec node .next/standalone/server.js
