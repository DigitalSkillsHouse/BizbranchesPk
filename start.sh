#!/bin/sh
# Backend uses 3002 (Railway may set PORT=3001 for the app)
# Frontend must use Railway's PORT to receive traffic
PORT=3002 npm run start:backend &
sleep 2
# Start frontend - binds to Railway's PORT
cd frontend && HOSTNAME=0.0.0.0 node .next/standalone/server.js
