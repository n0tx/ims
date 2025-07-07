#!/bin/bash
echo "Starting backend server on port 8000..."
cd "$(dirname "$0")"
node server.js