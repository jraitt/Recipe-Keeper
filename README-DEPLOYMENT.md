# Environment Configuration Guide

## 🔧 **For Development:**
```bash
# Copy development environment
cp .env.development .env

# Start development environment
docker-compose up -d
```

## 🚀 **For Production:**
```bash
# Copy production environment
cp .env.production .env

# Start production environment
docker-compose up -d
```

## 📋 **Current Status:**
- `.env` contains **production settings** for your current deployment
- `.env.development` contains **development-friendly settings**
- `.env.production` contains **production settings** (same as current .env)

## ⚠️ **Important:**
- Keep `.env` as-is for your current production deployment
- Use `.env.development` when developing locally
- Never commit `.env` files to version control