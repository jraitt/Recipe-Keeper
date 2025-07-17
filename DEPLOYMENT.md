# Production Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Domain name configured (optional but recommended)
- SSL certificates (optional but recommended)

### 1. Environment Setup
```bash
# Copy and configure production environment
cp .env.prod.example .env
# Edit .env with your production values
```

### 2. Deploy to Production
```bash
# Run the production deployment script
./deploy-prod.sh
```

### 3. Verify Deployment
- Frontend: http://localhost:3020
- Backend API: http://localhost:3021/api
- Health Check: http://localhost:3021/api/health

---

## 📋 Detailed Setup

### Environment Variables

#### Required Variables
- `NODE_ENV=production`
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `POSTGRES_PASSWORD` - Generate with: `openssl rand -base64 24`
- `GEMINI_API_KEY` - Your production Gemini API key
- `DATABASE_URL` - Must match your database password

#### Security Variables
- `CORS_ORIGIN` - Your production domain (e.g., https://recipes.yourdomain.com)
- `FORCE_HTTPS=true` - Force HTTPS redirects
- `HELMET_ENABLED=true` - Enable security headers
- `TRUST_PROXY=true` - Trust reverse proxy headers

### Manual Deployment Steps

#### 1. Build Production Images
```bash
# Build without cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

#### 2. Start Services
```bash
# Start in background
docker-compose -f docker-compose.prod.yml up -d
```

#### 3. Run Database Migrations
```bash
# Apply database migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate:prod
```

#### 4. Check Service Health
```bash
# View running services
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs
```

---

## 🔧 Production Architecture

### Service Overview
- **Frontend**: Nginx serving static React build
- **Backend**: Node.js API server with Express
- **Database**: PostgreSQL with persistent storage
- **Volumes**: Persistent storage for database and uploaded files

### Port Configuration
- Frontend: Port 3020 (HTTP) → Port 80 (Container)
- Backend: Port 3021 (HTTP)
- Database: Port 5432 (PostgreSQL)

### Security Features
- Non-root user in containers
- Security headers via Helmet
- CORS protection
- Rate limiting
- Input validation
- JWT authentication

---

## 🛠️ Maintenance

### Viewing Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs

# Specific service
docker-compose -f docker-compose.prod.yml logs backend
```

### Updating Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Backup
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres recipes > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres recipes < backup.sql
```

### Monitoring
```bash
# Resource usage
docker stats

# Service health
curl http://localhost:3021/api/health
```

---

## 🚨 Troubleshooting

### Common Issues

#### Services Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check permissions
ls -la uploads/
```

#### Database Connection Issues
```bash
# Check database health
docker-compose -f docker-compose.prod.yml exec db pg_isready -U postgres

# Reset database
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

#### Frontend 404 Errors
- Check nginx configuration
- Verify build files exist
- Check CORS configuration

### Health Checks
- Backend health: `http://localhost:3021/api/health`
- Database health: Built into Docker compose
- Frontend health: HTTP 200 on main page

---

## 📊 Performance Optimization

### Nginx Configuration
- Gzip compression enabled
- Static file caching (1 year)
- Security headers
- Client-side routing support

### Database Optimization
- Connection pooling
- Query optimization
- Regular maintenance

### Application Optimization
- Code splitting
- Image optimization
- Bundle size monitoring

---

## 🔒 Security Checklist

- [ ] Strong JWT secret configured
- [ ] Database password changed from default
- [ ] HTTPS enforced (if domain configured)
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] File upload restrictions in place
- [ ] Regular security updates applied

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database connection pooling
- Session storage (Redis)
- File storage (S3/CDN)

### Vertical Scaling
- Container resource limits
- Database memory allocation
- Node.js heap size tuning

---

*For additional support, see the main README.md or check the application logs.*