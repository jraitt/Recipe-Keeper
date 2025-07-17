#!/bin/bash

# Production deployment script for Recipe Keeper

set -e

echo "🚀 Starting production deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "❌ .env file not found. Please create it from .env.example"
  exit 1
fi

# Check if NODE_ENV is set to production
if ! grep -q "NODE_ENV=production" .env; then
  echo "❌ NODE_ENV is not set to production in .env file"
  exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images to free up space
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start production containers
echo "🏗️ Building production containers..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "▶️ Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend npm run migrate:prod

# Check if services are healthy
echo "🏥 Checking service health..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
  echo "✅ Production deployment successful!"
  echo "🌐 Frontend: http://localhost:3020"
  echo "🔧 Backend API: http://localhost:3021/api"
  echo "📊 Database: localhost:5432"
else
  echo "❌ Some services failed to start"
  docker-compose -f docker-compose.prod.yml logs
  exit 1
fi

echo "🎉 Production deployment complete!"