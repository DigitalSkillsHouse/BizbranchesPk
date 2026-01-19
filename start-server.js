#!/usr/bin/env node
/**
 * Startup script for Next.js standalone server on Railway
 * Ensures proper port handling and error reporting
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const standalonePath = path.join(process.cwd(), '.next', 'standalone', 'server.js');

console.log('='.repeat(60));
console.log('Next.js Standalone Server Startup');
console.log('='.repeat(60));
console.log(`PORT: ${PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`Working Directory: ${process.cwd()}`);
console.log(`Standalone Path: ${standalonePath}`);
console.log(`Standalone exists: ${fs.existsSync(standalonePath)}`);

if (!fs.existsSync(standalonePath)) {
  console.error('ERROR: Standalone server not found!');
  console.error('Make sure "next build" completed successfully.');
  console.error(`Expected at: ${standalonePath}`);
  process.exit(1);
}

console.log('Starting standalone server...');
console.log('='.repeat(60));

// Set PORT environment variable for the child process
const env = {
  ...process.env,
  PORT: PORT.toString(),
  NODE_ENV: process.env.NODE_ENV || 'production'
};

const server = spawn('node', [standalonePath], {
  env: env,
  stdio: 'inherit',
  cwd: path.join(process.cwd(), '.next', 'standalone')
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code, signal) => {
  console.error(`Server exited with code ${code} and signal ${signal}`);
  process.exit(code || 1);
});

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.kill('SIGINT');
});
