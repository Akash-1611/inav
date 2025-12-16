# Deployment Guide

This guide covers deploying the Payment Collection App to AWS EC2 using Docker Compose.

## Prerequisites

- AWS EC2 instance (Ubuntu 20.04 or later recommended)
- SSH access to EC2 instance
- Security groups configured for:
  - Port 22 (SSH)
  - Port 3000 (Backend API)
  - Port 19000-19002 (Expo - optional, for development)
  - Port 5432 (PostgreSQL - only if accessing externally)

## Step 1: Prepare EC2 Instance

### 1.1 Launch EC2 Instance

1. Log in to AWS Console
2. Launch an EC2 instance (t2.micro or larger)
3. Select Ubuntu 20.04 LTS or later
4. Configure security group to allow:
   - SSH (22) from your IP
   - HTTP (80) and HTTPS (443) - if using reverse proxy
   - Custom TCP (3000) - Backend API
   - Custom TCP (19000-19002) - Expo (optional)

### 1.2 Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## Step 2: Install Dependencies

### 2.1 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 2.2 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and log back in for group changes to take effect
exit
```

Reconnect to EC2:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## Step 3: Deploy Application

### 3.1 Clone Repository

```bash
# Option 1: Clone from GitHub
git clone <your-repo-url>
cd nav

# Option 2: Upload files using SCP
# From your local machine:
scp -i your-key.pem -r ./nav ubuntu@your-ec2-ip:~/
```

### 3.2 Configure Environment

```bash
cd nav

# Update backend .env (if needed)
nano backend/.env

# Update frontend .env with EC2 public IP
echo "EXPO_PUBLIC_API_URL=http://YOUR-EC2-PUBLIC-IP:3000/api" > frontend/.env
```

**Important:** Replace `YOUR-EC2-PUBLIC-IP` with your actual EC2 public IP address.

### 3.3 Update docker-compose.yml (if needed)

For production, you may want to:
- Remove frontend service (if deploying mobile app separately)
- Add environment variables
- Configure volumes for data persistence

### 3.4 Start Services

```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Step 4: Verify Deployment

### 4.1 Check Backend

```bash
# From EC2
curl http://localhost:3000/health

# From your local machine
curl http://YOUR-EC2-PUBLIC-IP:3000/health
```

### 4.2 Check Database

```bash
# From EC2
docker-compose exec db psql -U postgres -d payment_collection -c "SELECT COUNT(*) FROM customers;"
```

### 4.3 Test API Endpoints

```bash
# Get customers
curl http://YOUR-EC2-PUBLIC-IP:3000/api/customers

# Create payment
curl -X POST http://YOUR-EC2-PUBLIC-IP:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{"account_number": "ACC001", "payment_amount": 15000}'
```

## Step 5: Set Up Reverse Proxy (Optional but Recommended)

Using Nginx as a reverse proxy provides:
- SSL/TLS termination
- Better security
- Single port access

### 5.1 Install Nginx

```bash
sudo apt install nginx -y
```

### 5.2 Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/payment-app
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your EC2 public IP

    location /api {
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
}
```

### 5.3 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/payment-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5.4 Update Frontend API URL

```bash
echo "EXPO_PUBLIC_API_URL=http://your-domain.com/api" > frontend/.env
docker-compose restart frontend
```

## Step 6: Set Up SSL (Optional)

### 6.1 Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

Follow the prompts to complete SSL setup.

## Step 7: Set Up Auto-Start on Reboot

### 7.1 Create Systemd Service

```bash
sudo nano /etc/systemd/system/payment-app.service
```

Add:

```ini
[Unit]
Description=Payment Collection App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/nav
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

### 7.2 Enable Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable payment-app.service
sudo systemctl start payment-app.service
```

## Step 8: CI/CD with GitHub Actions

### 8.1 Set Up GitHub Secrets

In your GitHub repository, go to Settings > Secrets and add:

- `EC2_HOST`: Your EC2 public IP
- `EC2_USER`: ubuntu (or your username)
- `EC2_SSH_KEY`: Your private SSH key content

### 8.2 GitHub Actions Workflow

The workflow file (`.github/workflows/deploy.yml`) is already configured. It will:
- Build Docker images
- Deploy to EC2 on push to main/master branch
- Restart services automatically

### 8.3 Manual Deployment

```bash
# Pull latest changes
cd ~/nav
git pull

# Restart services
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

### Issue: Services won't start

```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps

# Restart services
docker-compose restart
```

### Issue: Database connection failed

```bash
# Check database container
docker-compose logs db

# Verify database is running
docker-compose exec db pg_isready -U postgres
```

### Issue: Port already in use

```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Issue: Out of memory

```bash
# Check memory usage
free -h

# Consider upgrading EC2 instance or adding swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Check Resource Usage

```bash
# Docker stats
docker stats

# System resources
htop
```

## Backup

### Database Backup

```bash
# Create backup
docker-compose exec db pg_dump -U postgres payment_collection > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T db psql -U postgres payment_collection < backup_YYYYMMDD.sql
```

## Security Best Practices

1. **Use environment variables** for sensitive data
2. **Enable firewall** (UFW):
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
3. **Keep system updated**: `sudo apt update && sudo apt upgrade`
4. **Use SSL/TLS** for production
5. **Restrict database access** to localhost only
6. **Use strong passwords** for database
7. **Regular backups** of database

## Next Steps

- Set up monitoring (e.g., CloudWatch, Datadog)
- Configure auto-scaling if needed
- Set up automated backups
- Implement logging and error tracking
- Set up staging environment

