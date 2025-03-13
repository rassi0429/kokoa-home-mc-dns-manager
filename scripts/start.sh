#!/bin/sh

# Start the application
echo "Starting kokoa-home-mc-dns-manager..."

# Start the backend server
node packages/backend/dist/index.js
