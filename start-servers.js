#!/usr/bin/env node
/**
 * Startup script to run both the frontend Express server and backend API server
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start the frontend Express server
const frontendServer = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Start the backend API server
const backendServer = spawn('node', ['server.js'], {
  cwd: join(__dirname, 'backend'),
  stdio: 'pipe',
  env: process.env
});

// Handle frontend server output
frontendServer.stdout.on('data', (data) => {
  console.log(`[Frontend] ${data}`);
});

frontendServer.stderr.on('data', (data) => {
  console.error(`[Frontend Error] ${data}`);
});

// Handle backend server output
backendServer.stdout.on('data', (data) => {
  console.log(`[Backend] ${data}`);
});

backendServer.stderr.on('data', (data) => {
  console.error(`[Backend Error] ${data}`);
});

// Handle process cleanup
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  frontendServer.kill('SIGINT');
  backendServer.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down servers...');
  frontendServer.kill('SIGTERM');
  backendServer.kill('SIGTERM');
  process.exit(0);
});

console.log('🚀 Starting both frontend and backend servers...');
console.log('📱 Frontend (Express + Vite): http://localhost:5000');
console.log('🔧 Backend API: http://localhost:8000');