# 🍽️ Recipe Keeper - Server Deployment Guide

This guide will help you deploy the Recipe Keeper application on a Linux server using Docker and Nginx reverse proxy with SSL.

## 📋 Prerequisites

- Linux server with Docker and Docker Compose installed
- Nginx web server installed and running
- Domain name registered (e.g., `compound-interests.com`)
- Certbot installed for SSL certificates

## 🚀 Deployment Steps

### 1. 📂 Get the Project Code

**For first-time deployment:**
```bash
git clone https://github.com/jraitt/Recipe-Keeper.git
cd Recipe-Keeper
```

**For updates to existing deployment:**
```bash
cd Recipe-Keeper
git pull origin main
```

### 2. 🌐 Configure DNS

At your domain registrar (e.g., Ionos), create a new subdomain:

**Result:** `recipes.compound-interests.com` → Your Server IP

### 3. 🔧 Configure Nginx Reverse Proxy

Create the Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/recipes.conf
```

**Paste the following configuration:**

```nginx
server {
    listen 80;
    server_name recipes.compound-interests.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend (React app)
    location / {
        proxy_pass http://127.0.0.1:3020;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
        proxy_connect_timeout 90;
        proxy_send_timeout 90;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3021;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
        proxy_connect_timeout 90;
        proxy_send_timeout 90;
    }

    # File uploads (images)
    location /uploads/ {
        proxy_pass http://127.0.0.1:3021;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
        proxy_read_timeout 90;
        proxy_connect_timeout 90;
        proxy_send_timeout 90;
    }

    # Optional: Handle favicon
    location /favicon.ico {
        proxy_pass http://127.0.0.1:3020;
        access_log off;
        log_not_found off;
    }
}
```

### 4. 🔐 Enable Site and Configure SSL

**Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/recipes.conf /etc/nginx/sites-enabled/
```

**Test Nginx configuration:**
```bash
sudo nginx -t
```

**If test passes, reload Nginx:**
```bash
sudo systemctl reload nginx
```

**Install SSL certificate with Certbot:**
```bash
sudo certbot --nginx -d recipes.compound-interests.com
```

> 📝 **Note:** Certbot will automatically modify your Nginx configuration to handle HTTPS and HTTP-to-HTTPS redirection.

### 5. 🐳 Deploy with Docker

**Set up production environment:**
```bash
# Copy production environment variables
cp .env.production .env
```

**Build and start the containers:**
```bash
docker compose up -d --build
```

**Monitor the deployment:**
```bash
# Check container status
docker compose ps

# View logs (optional)
docker compose logs -f

# View logs for specific service
docker compose logs -f frontend
docker compose logs -f backend
```

### 6. ✅ Verify Deployment

**Check that all services are running:**
```bash
docker compose ps
```

Expected output:
```
NAME                    IMAGE                     COMMAND                  SERVICE             STATUS              PORTS
recipe-keeper-backend   recipe-keeper-backend     "npm run dev"           backend             Up 2 minutes        0.0.0.0:3021->3021/tcp
recipe-keeper-frontend  recipe-keeper-frontend    "npm run dev"           frontend            Up 2 minutes        0.0.0.0:3020->3020/tcp
recipe-keeper-db        postgres:15-alpine        "docker-entrypoint.s…"   db                  Up 2 minutes        0.0.0.0:5432->5432/tcp
```

**Test the application:**
1. Visit `https://recipes.compound-interests.com`
2. Verify SSL certificate is working (🔒 icon in browser)
3. Test user registration/login
4. Test recipe creation and AI import features

## 🔧 Maintenance Commands

### Update Application
```bash
cd Recipe-Keeper
git pull origin main
# Ensure production environment is active
cp .env.production .env
docker compose down
docker compose up -d --build
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Restart Services
```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend
```

### Stop Application
```bash
docker compose down
```

### Clean Up (removes containers and volumes)
```bash
docker compose down -v
docker system prune -f
```

## 🛠️ Troubleshooting

### Common Issues

**1. SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

**2. Nginx Configuration Issues**
```bash
# Test configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Reload configuration
sudo systemctl reload nginx
```

**3. Docker Container Issues**
```bash
# Check container logs
docker compose logs backend

# Restart containers
docker compose restart

# Rebuild containers
docker compose up -d --build --force-recreate
```

**4. Database Connection Issues**
```bash
# Check database container
docker compose logs db

# Connect to database directly
docker compose exec db psql -U postgres -d recipes
```

## 📊 Performance Optimization

### Enable Nginx Caching (Optional)
Add to your Nginx configuration:
```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    proxy_pass http://127.0.0.1:3020;
}
```

### Monitor Resource Usage
```bash
# Check Docker resource usage
docker stats

# Check system resources
htop
df -h
```

## 🔒 Security Considerations

1. **Keep your server updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use strong JWT secrets** (generate with `openssl rand -base64 32`)

3. **Regularly update SSL certificates** (Certbot handles this automatically)

4. **Monitor logs for suspicious activity**

5. **Consider using a firewall** (ufw or iptables)

## 📞 Support

If you encounter issues:
1. Check the logs using the commands above
2. Verify your environment variables are set correctly
3. Ensure your domain DNS is properly configured
4. Check that all required ports are open on your server

---

**🎉 Congratulations!** Your Recipe Keeper application should now be live at `https://recipes.compound-interests.com`