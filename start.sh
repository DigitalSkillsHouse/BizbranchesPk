#!/bin/sh
# Start backend on 3001 in background
PORT=3001 npm run start:backend &
sleep 2
# Start frontend (must bind to Railway's PORT)
cd frontend && HOSTNAME=0.0.0.0 node .next/standalone/server.js
