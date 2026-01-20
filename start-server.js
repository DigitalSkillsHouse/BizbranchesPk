#!/usr/bin/env node
/**
 * Smart startup script for Next.js server
 * Automatically chooses between standalone mode (production) and custom server (dev/fallback)
 */

const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const isProduction = NODE_ENV === 'production';
const standalonePath = path.join(process.cwd(), '.next', 'standalone', 'server.js');
const customServerPath = path.join(process.cwd(), 'server.js');
const hasStandalone = fs.existsSync(standalonePath);
const hasCustomServer = fs.existsSync(customServerPath);

console.log('='.repeat(60));
console.log('Next.js Server Startup');
console.log('='.repeat(60));
console.log(`PORT: ${PORT}`);
console.log(`NODE_ENV: ${NODE_ENV}`);
console.log(`Working Directory: ${process.cwd()}`);
console.log(`Standalone build exists: ${hasStandalone}`);
console.log(`Custom server exists: ${hasCustomServer}`);
console.log('='.repeat(60));

// Decision logic:
// 1. If standalone exists and we're in production, use it (optimal for Railway)
// 2. Otherwise, use custom server.js (works in dev and as fallback)
// 3. If neither exists, show helpful error

if (hasStandalone && isProduction) {
  console.log('✓ Using standalone server (production mode)');
  console.log(`Starting: ${standalonePath}`);
  console.log('='.repeat(60));
  
  // Use standalone server
  // Note: Next.js standalone server should be run from the standalone directory
  // but we need to ensure the parent .next directory is accessible for static files
  const { spawn } = require('child_process');
  const env = {
    ...process.env,
    PORT: PORT.toString(),
    NODE_ENV: 'production',
    HOSTNAME: process.env.HOSTNAME || '0.0.0.0'
  };

  const standaloneDir = path.join(process.cwd(), '.next', 'standalone');
  const server = spawn('node', ['server.js'], {
    env: env,
    stdio: 'inherit',
    cwd: standaloneDir
  });

  server.on('error', (err) => {
    console.error('Failed to start standalone server:', err);
    process.exit(1);
  });

  server.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`Standalone server exited with code ${code} and signal ${signal}`);
      process.exit(code || 1);
    }
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    server.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down...');
    server.kill('SIGINT');
  });
} else if (hasCustomServer) {
  console.log('✓ Using custom server.js');
  if (!hasStandalone && isProduction) {
    console.log('⚠ Warning: Standalone build not found, using custom server as fallback');
    console.log('  Run "npm run build" first for optimal production performance');
  }
  console.log(`Starting: ${customServerPath}`);
  console.log('='.repeat(60));
  
  // Use custom server
  require(customServerPath);
} else {
  console.error('='.repeat(60));
  console.error('ERROR: No server found!');
  console.error('='.repeat(60));
  console.error('Expected one of:');
  console.error(`  1. Standalone: ${standalonePath}`);
  console.error(`  2. Custom server: ${customServerPath}`);
  console.error('');
  console.error('Solutions:');
  console.error('  - For development: Run "npm run dev"');
  console.error('  - For production: Run "npm run build" first, then "npm start"');
  console.error('='.repeat(60));
  process.exit(1);
}
