#!/bin/bash
echo "Starting Vite in production mode with HMR disabled..."
export NODE_ENV=production
vite --host 0.0.0.0 --port 3020 --no-hmr