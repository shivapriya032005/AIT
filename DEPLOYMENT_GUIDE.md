# AI Tester - Deployment Guide

Complete guide for deploying the AI Tester application using various methods.

## Table of Contents
1. [Building the Wheel Package](#building-the-wheel-package)
2. [Local Deployment](#local-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Cloud Deployment](#cloud-deployment)

---

## Building the Wheel Package

### Prerequisites
```bash
pip install build wheel setuptools
```

### Build Steps

#### 1. Clean Previous Builds
```bash
# Remove old build artifacts
rm -rf build/ dist/ *.egg-info
```

#### 2. Build the Wheel
```bash
# Build wheel package
python -m build --wheel

# Or using setup.py directly
python setup.py bdist_wheel
```

#### 3. Verify the Build
```bash
# Check the dist directory
ls dist/
# Should see: ai_tester-1.0.0-py3-none-any.whl
```

#### 4. Install the Wheel
```bash
# Install locally
pip install dist/ai_tester-1.0.0-py3-none-any.whl

# Or install in editable mode for development
pip install -e .
```

---

## Local Deployment

### Method 1: Direct Python Execution

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Initialize database
python database.py

# 3. Set environment variables
export FLASK_ENV=development
export SECRET_KEY=your-secret-key-here

# 4. Run the application
python app.py
```

Access at: `http://127.0.0.1:5000`

### Method 2: Using the Wheel Package

```bash
# 1. Build and install wheel
python -m build --wheel
pip install dist/ai_tester-1.0.0-py3-none-any.whl

# 2. Initialize database
python database.py

# 3. Run using entry point
ai-tester
```

---

## Docker Deployment

### Method 1: Using Docker

#### Build the Image
```bash
docker build -t ai-tester:latest .
```

#### Run the Container
```bash
docker run -d \
  --name ai-tester \
  -p 5000:5000 \
  -e SECRET_KEY=your-secret-key \
  -v $(pwd)/ai_tester.db:/app/ai_tester.db \
  ai-tester:latest
```

#### View Logs
```bash
docker logs -f ai-tester
```

#### Stop Container
```bash
docker stop ai-tester
docker rm ai-tester
```

### Method 2: Using Docker Compose

#### Start Services
```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Environment Variables
Create `.env` file:
```env
SECRET_KEY=your-super-secret-key-change-this
FLASK_ENV=production
PORT=5000
```

---

## Production Deployment

### Using Gunicorn (Recommended)

#### 1. Install Gunicorn
```bash
pip install gunicorn
```

#### 2. Create Gunicorn Config
Create `gunicorn_config.py`:
```python
import multiprocessing

bind = "0.0.0.0:5000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging
accesslog = "logs/access.log"
errorlog = "logs/error.log"
loglevel = "info"

# Process naming
proc_name = "ai-tester"

# Server mechanics
daemon = False
pidfile = "ai-tester.pid"
```

#### 3. Run with Gunicorn
```bash
# Create logs directory
mkdir -p logs

# Run Gunicorn
gunicorn -c gunicorn_config.py app:app
```

### Using Systemd (Linux)

#### 1. Create Service File
Create `/etc/systemd/system/ai-tester.service`:
```ini
[Unit]
Description=AI Tester Web Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/ai-tester
Environment="PATH=/opt/ai-tester/venv/bin"
Environment="SECRET_KEY=your-secret-key"
Environment="FLASK_ENV=production"
ExecStart=/opt/ai-tester/venv/bin/gunicorn -c gunicorn_config.py app:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 2. Enable and Start Service
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable ai-tester

# Start service
sudo systemctl start ai-tester

# Check status
sudo systemctl status ai-tester

# View logs
sudo journalctl -u ai-tester -f
```

### Nginx Reverse Proxy

#### 1. Install Nginx
```bash
sudo apt install nginx
```

#### 2. Configure Nginx
Create `/etc/nginx/sites-available/ai-tester`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /static {
        alias /opt/ai-tester/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3. Enable Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/ai-tester /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 4. SSL with Let's Encrypt
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

## Cloud Deployment

### Heroku

#### 1. Create Procfile
```
web: gunicorn app:app
```

#### 2. Create runtime.txt
```
python-3.11.0
```

#### 3. Deploy
```bash
# Login to Heroku
heroku login

# Create app
heroku create ai-tester-app

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set FLASK_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

### AWS EC2

#### 1. Launch EC2 Instance
- Choose Ubuntu 22.04 LTS
- Select t2.micro or larger
- Configure security group (ports 22, 80, 443)

#### 2. Connect and Setup
```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3-pip python3-venv nginx -y

# Clone or upload your application
cd /opt
sudo git clone your-repo-url ai-tester
cd ai-tester

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn

# Initialize database
python database.py

# Follow systemd and nginx setup from above
```

### Google Cloud Platform (Cloud Run)

#### 1. Create cloudbuild.yaml
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/ai-tester', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/ai-tester']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'ai-tester'
      - '--image=gcr.io/$PROJECT_ID/ai-tester'
      - '--platform=managed'
      - '--region=us-central1'
      - '--allow-unauthenticated'
```

#### 2. Deploy
```bash
# Build and deploy
gcloud builds submit --config cloudbuild.yaml
```

### DigitalOcean App Platform

#### 1. Create app.yaml
```yaml
name: ai-tester
services:
  - name: web
    github:
      repo: your-username/ai-tester
      branch: main
    build_command: pip install -r requirements.txt
    run_command: gunicorn -w 4 -b 0.0.0.0:8080 app:app
    environment_slug: python
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: SECRET_KEY
        value: your-secret-key
        type: SECRET
      - key: FLASK_ENV
        value: production
```

---

## Post-Deployment Checklist

### Security
- [ ] Set strong SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Configure CORS if needed
- [ ] Review file permissions

### Monitoring
- [ ] Set up application logging
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring
- [ ] Set up alerts for errors

### Performance
- [ ] Enable gzip compression
- [ ] Configure static file caching
- [ ] Set up CDN for static assets
- [ ] Optimize database queries
- [ ] Configure connection pooling

### Maintenance
- [ ] Set up automated backups
- [ ] Configure log rotation
- [ ] Plan update strategy
- [ ] Document deployment process
- [ ] Set up staging environment

---

## Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
pip cache purge
rm -rf build/ dist/ *.egg-info
python -m build --wheel
```

### Permission Issues
```bash
# Fix file permissions
chmod +x app.py
chown -R www-data:www-data /opt/ai-tester
```

### Database Issues
```bash
# Reinitialize database
rm ai_tester.db
python database.py
```

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
# Or on Windows
netstat -ano | findstr :5000

# Kill process
kill -9 <PID>
```

---

## Support

For deployment issues:
- Check logs: `docker logs ai-tester` or `journalctl -u ai-tester`
- Review error messages
- Check firewall and security group settings
- Verify environment variables
- Ensure database is initialized

---

## Version History

- **v1.0.0** - Initial release with wheel packaging support
