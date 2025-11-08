# 🚀 Deployment Guide - AirLens

> Complete guide to deploy AirLens on Docker and make it publicly accessible

---

## 📋 Table of Contents

1. [Local Docker Deployment](#1-local-docker-deployment)
2. [Cloud Deployment Options](#2-cloud-deployment-options)
3. [AWS Deployment (Recommended)](#3-aws-deployment-ec2--lightsail)
4. [DigitalOcean Deployment](#4-digitalocean-deployment)
5. [Railway Deployment (Easiest)](#5-railway-deployment-easiest)
6. [Domain & SSL Setup](#6-domain--ssl-setup)
7. [Monitoring & Maintenance](#7-monitoring--maintenance)

---

## 1. Local Docker Deployment

### Prerequisites
```bash
# Install Docker Desktop (Windows/Mac)
# Download from: https://www.docker.com/products/docker-desktop

# Verify installation
docker --version
docker-compose --version
```

### Step 1: Prepare Environment
```bash
# Navigate to project directory
cd Smart-Environmental-Monitoring

# Create .env file
cat > .env << EOF
WEATHERAPI_API_KEY=your_weatherapi_key_here
AQICN_API_KEY=your_aqicn_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
EOF
```

### Step 2: Build and Run
```bash
# Build images
docker-compose build

# Start services in detached mode
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 3: Access Locally
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Step 4: Stop Services
```bash
# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## 2. Cloud Deployment Options

### Comparison Table

| Platform | Difficulty | Cost/Month | Best For |
|----------|-----------|------------|----------|
| **Railway** | ⭐ Easy | $5-10 | Quick deployment, beginners |
| **DigitalOcean** | ⭐⭐ Medium | $6-12 | Droplets, managed databases |
| **AWS EC2** | ⭐⭐⭐ Hard | $10-30 | Full control, scalability |
| **Heroku** | ⭐ Easy | $7-25 | Simple apps (2 containers) |
| **Render** | ⭐⭐ Medium | $7-15 | Docker native, auto-deploy |
| **Azure** | ⭐⭐⭐ Hard | $10-40 | Enterprise, Windows integration |
| **Google Cloud** | ⭐⭐⭐ Hard | $10-35 | GCP ecosystem |

---

## 3. AWS Deployment (EC2 / Lightsail)

### Option A: AWS Lightsail (Recommended for Beginners)

#### Step 1: Create Lightsail Instance
```bash
# 1. Go to: https://lightsail.aws.amazon.com/
# 2. Click "Create Instance"
# 3. Select:
#    - Platform: Linux/Unix
#    - Blueprint: OS Only → Ubuntu 22.04 LTS
#    - Instance Plan: $10/month (2GB RAM, 1 vCPU)
# 4. Name: envira-monitor
# 5. Click "Create Instance"
```

#### Step 2: Connect via SSH
```bash
# Download SSH key from Lightsail console
# Connect (replace with your IP)
ssh -i LightsailDefaultKey.pem ubuntu@YOUR_INSTANCE_IP
```

#### Step 3: Install Docker on Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for group changes
exit
# SSH back in
ssh -i LightsailDefaultKey.pem ubuntu@YOUR_INSTANCE_IP

# Verify
docker --version
docker-compose --version
```

#### Step 4: Deploy Application
```bash
# Install git
sudo apt install git -y

# Clone repository
git clone https://github.com/YOUR_USERNAME/Smart-Environmental-Monitoring.git
cd Smart-Environmental-Monitoring

# Create .env file
nano .env
# Paste your environment variables and save (Ctrl+O, Enter, Ctrl+X)

# Build and run
docker-compose up --build -d

# Check logs
docker-compose logs -f
```

#### Step 5: Configure Firewall
```bash
# In Lightsail console:
# 1. Go to Networking tab
# 2. Add firewall rules:
#    - Custom TCP, Port 3000, Source: Anywhere (0.0.0.0/0)
#    - Custom TCP, Port 8000, Source: Anywhere (0.0.0.0/0)
#    - HTTP, Port 80, Source: Anywhere (0.0.0.0/0)
#    - HTTPS, Port 443, Source: Anywhere (0.0.0.0/0)
```

#### Step 6: Access Application
```
Frontend: http://YOUR_INSTANCE_IP:3000
Backend: http://YOUR_INSTANCE_IP:8000
```

### Option B: AWS EC2 (Advanced)

#### Step 1: Launch EC2 Instance
```bash
# 1. Go to EC2 Console: https://console.aws.amazon.com/ec2/
# 2. Click "Launch Instance"
# 3. Configure:
#    - Name: envira-monitor
#    - AMI: Ubuntu Server 22.04 LTS
#    - Instance Type: t3.small (2 vCPU, 2GB RAM)
#    - Key Pair: Create new or use existing
#    - Security Group: Create new
#      - SSH (22) from My IP
#      - HTTP (80) from Anywhere
#      - HTTPS (443) from Anywhere
#      - Custom TCP (3000) from Anywhere
#      - Custom TCP (8000) from Anywhere
# 4. Storage: 20GB gp3
# 5. Launch Instance
```

#### Step 2: Connect and Deploy
```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Follow same Docker installation steps as Lightsail (Step 3-4)
```

#### Step 3: Setup Nginx Reverse Proxy (Production)
```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/envira-monitor

# Paste this configuration:
```

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/envira-monitor /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Now access via: http://YOUR_DOMAIN.com (or http://YOUR_EC2_IP)
```

---

## 4. DigitalOcean Deployment

### Step 1: Create Droplet
```bash
# 1. Go to: https://cloud.digitalocean.com/
# 2. Create → Droplets
# 3. Choose:
#    - Ubuntu 22.04 LTS
#    - Basic Plan: $6/month (1GB RAM)
#    - Add SSH Key or use password
#    - Hostname: envira-monitor
# 4. Create Droplet
```

### Step 2: Deploy
```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Follow Docker installation steps (same as AWS Step 3-4)
```

### Step 3: Configure Firewall
```bash
# DigitalOcean Firewall (recommended)
# In DO Console → Networking → Firewalls
# Create firewall with rules:
# - Inbound: HTTP (80), HTTPS (443), SSH (22), Custom (3000, 8000)
# - Outbound: All TCP, All UDP, All ICMP
```

---

## 5. Railway Deployment (Easiest)

Railway provides the simplest deployment with automatic CI/CD.

### Step 1: Prepare Repository
```bash
# Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/Smart-Environmental-Monitoring.git
git push -u origin main
```

### Step 2: Deploy on Railway
```bash
# 1. Go to: https://railway.app/
# 2. Sign up with GitHub
# 3. Click "New Project" → "Deploy from GitHub repo"
# 4. Select your repository
# 5. Railway will detect docker-compose.yml
```

### Step 3: Configure Services

**Backend Service:**
```bash
# 1. Click "backend" service
# 2. Settings → Environment Variables:
#    WEATHERAPI_API_KEY = your_key
#    AQICN_API_KEY = your_key
#    SUPABASE_URL = your_url
#    SUPABASE_KEY = your_key
# 3. Settings → Networking → Generate Domain
# 4. Copy the public URL (e.g., backend.railway.app)
```

**Frontend Service:**
```bash
# 1. Click "frontend" service
# 2. Settings → Environment Variables:
#    VITE_API_URL = https://YOUR_BACKEND_URL.railway.app
# 3. Settings → Networking → Generate Domain
# 4. Copy the public URL (e.g., frontend.railway.app)
```

### Step 4: Access Application
```
Your app is now live at:
https://YOUR_FRONTEND_URL.railway.app
```

**Pros:**
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push
- ✅ Free tier available ($5 credit/month)
- ✅ Built-in monitoring

**Cons:**
- ❌ Can get expensive with traffic
- ❌ Less control than VPS

---

## 6. Domain & SSL Setup

### Option A: Using Cloudflare (Free SSL)

#### Step 1: Get Domain
```bash
# Buy domain from:
# - Namecheap ($8-12/year)
# - GoDaddy ($10-15/year)
# - Google Domains ($12/year)
```

#### Step 2: Setup Cloudflare
```bash
# 1. Go to: https://cloudflare.com
# 2. Add Site → Enter your domain
# 3. Select Free Plan
# 4. Cloudflare will provide nameservers
# 5. Update nameservers in your domain registrar
# 6. Wait 24-48 hours for propagation
```

#### Step 3: Add DNS Records
```bash
# In Cloudflare DNS settings:
# Type: A, Name: @, Content: YOUR_SERVER_IP, Proxy: Enabled
# Type: A, Name: www, Content: YOUR_SERVER_IP, Proxy: Enabled
```

#### Step 4: SSL Configuration
```bash
# In Cloudflare → SSL/TLS:
# 1. Set Encryption Mode: "Full"
# 2. Enable "Always Use HTTPS"
# 3. Enable "Automatic HTTPS Rewrites"
```

Now access at: `https://yourdomain.com`

### Option B: Using Let's Encrypt (Free SSL on Server)

```bash
# SSH into your server
ssh ubuntu@YOUR_SERVER_IP

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Select "2" to redirect HTTP to HTTPS

# Test auto-renewal
sudo certbot renew --dry-run

# Certificates auto-renew every 90 days
```

---

## 7. Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl http://YOUR_SERVER_IP:8000/api/health

# Frontend health (if using nginx)
curl http://YOUR_SERVER_IP:3000/health
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Update Application
```bash
# Pull latest changes
cd Smart-Environmental-Monitoring
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

### Backup Database
```bash
# Your data is in Supabase (cloud)
# But backup environment variables:
cp .env .env.backup

# Backup using Supabase dashboard:
# 1. Go to Supabase project
# 2. Database → Backups
# 3. Download backup
```

### Monitor Resources
```bash
# Check Docker stats
docker stats

# Check disk usage
df -h

# Check memory
free -h

# Check Docker disk usage
docker system df
```

### Auto-restart on Reboot
```bash
# Create systemd service
sudo nano /etc/systemd/system/envira-monitor.service

# Paste:
```

```ini
[Unit]
Description=Envira Monitor Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/Smart-Environmental-Monitoring
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Enable service
sudo systemctl enable envira-monitor.service
sudo systemctl start envira-monitor.service

# Check status
sudo systemctl status envira-monitor.service
```

---

## 🎯 Quick Deployment Checklist

### Pre-Deployment
- [ ] Environment variables ready
- [ ] Supabase database created
- [ ] RLS disabled on Supabase table
- [ ] API keys obtained (WeatherAPI, AQICN)
- [ ] GitHub repository created (if using Railway)

### During Deployment
- [ ] Server created and accessible
- [ ] Docker installed
- [ ] Repository cloned
- [ ] .env file created with correct values
- [ ] Firewall rules configured
- [ ] Application built successfully
- [ ] Containers running

### Post-Deployment
- [ ] Health endpoints responding
- [ ] Frontend accessible
- [ ] Backend API working
- [ ] Data ingestion happening (check at 12 PM)
- [ ] Domain pointed (if using custom domain)
- [ ] SSL configured
- [ ] Monitoring setup
- [ ] Auto-restart configured

---

## 🆘 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Common issues:
# - Missing .env file
# - Wrong environment variables
# - Port already in use
```

### Can't access application
```bash
# Check if containers are running
docker-compose ps

# Check firewall
sudo ufw status  # Ubuntu
sudo firewall-cmd --list-all  # CentOS

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

### Database connection error
```bash
# Verify Supabase credentials in .env
# Check if Supabase project is active
# Verify RLS is disabled: ALTER TABLE environmental_data DISABLE ROW LEVEL SECURITY;
```

### Out of memory
```bash
# Check memory usage
free -h
docker stats

# Restart containers
docker-compose restart

# Upgrade server if needed
```

---

## 📊 Cost Estimate

### Minimal Setup (~$10/month)
- AWS Lightsail: $5/month
- Domain: $1/month (amortized)
- Supabase: Free tier
- **Total: ~$6/month**

### Recommended Setup (~$15/month)
- DigitalOcean Droplet: $6/month
- Domain: $1/month
- Cloudflare: Free
- Supabase: Free tier
- **Total: ~$7/month**

### Railway Setup (~$10-15/month)
- Railway: $5-10/month (depending on usage)
- Domain: $1/month
- Supabase: Free tier
- **Total: ~$6-11/month**

---

## 🎉 Recommended Path for Beginners

1. **Start with Railway** (5 minutes setup)
   - Easiest deployment
   - Auto HTTPS
   - No server management

2. **Move to Lightsail** when ready (better control)
   - More cost-effective
   - Better performance
   - Custom domain support

3. **Graduate to EC2/ECS** for production (advanced)
   - Full scalability
   - Load balancing
   - Auto-scaling

---

## 📞 Need Help?

- Check logs: `docker-compose logs -f`
- Verify health: `curl http://localhost:8000/api/health`
- Restart: `docker-compose restart`
- Rebuild: `docker-compose up --build -d`

Happy Deploying! 🚀
