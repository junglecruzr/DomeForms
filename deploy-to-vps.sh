#!/bin/bash
# DomeForms VPS Deployment Script
# Targets VPS at your-vps-ip - Deploys isolated container on port 3003

set -e

VPS_IP="your-vps-ip"
VPS_USER="root"
REMOTE_DIR="/var/www/domeforms"
LOCAL_DIR="/path/to/domeforms/deploy/domeforms"

echo "========================================="
echo "   DomeForms VPS Deployer (Port 3003)    "
echo "========================================="
echo ""

# Check local source directory
if [ ! -d "$LOCAL_DIR" ]; then
    echo "Error: Local build directory $LOCAL_DIR does not exist."
    exit 1
fi

echo "[1/4] Preparing Dockerfile for VPS deployment..."
cat > "$LOCAL_DIR/Dockerfile" << 'DOCKERFILE'
FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir flask==3.1.3 flask-cors==0.0.1
COPY . .
RUN mkdir -p data
EXPOSE 8000
CMD ["python3", "app.py"]
DOCKERFILE
echo "  ✓ Dockerfile generated"

echo "[2/4] Uploading application files to VPS ($VPS_IP)..."
ssh "$VPS_USER@$VPS_IP" "mkdir -p $REMOTE_DIR/data"
rsync -avz --exclude='data/domeforms.db' "$LOCAL_DIR/" "$VPS_USER@$VPS_IP:$REMOTE_DIR/"
echo "  ✓ Files uploaded to $REMOTE_DIR"

echo "[3/4] Building and launching Docker container on port 3003..."
ssh "$VPS_USER@$VPS_IP" << 'REMOTECMDS'
cd /var/www/domeforms

# Stop and remove existing container if running
docker stop domeforms-service 2>/dev/null || true
docker rm domeforms-service 2>/dev/null || true

# Build new image
docker build -t domeforms-app .

# Run on port 3003
docker run -d \
  --name domeforms-service \
  --restart unless-stopped \
  -p 3003:8000 \
  -v /var/www/domeforms/data:/app/data \
  domeforms-app

echo "  ✓ Container domeforms-service running on port 3003"
REMOTECMDS

echo "[4/4] Configuring Nginx reverse proxy for domeforms.yourdomain.com..."
ssh "$VPS_USER@$VPS_IP" << 'NGINXCMDS'
cat > /etc/nginx/sites-available/domeforms.yourdomain.com << 'NGINXCONF'
server {
    listen 80;
    server_name domeforms.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXCONF

ln -sf /etc/nginx/sites-available/domeforms.yourdomain.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
echo "  ✓ Nginx configured and reloaded for port 3003"
NGINXCMDS

echo ""
echo "========================================="
echo "   Deployment Complete!"
echo "========================================="
echo "Health Check: http://$VPS_IP:3003/api/health"
echo "Domain:       http://domeforms.yourdomain.com/api/health"
echo "========================================="
