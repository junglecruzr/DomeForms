#!/bin/bash
# DomeForms Server Deployment Script
# Run this from your LOCAL computer

set -e

VPS_USER="root"
VPS_HOST="72.62.161.34"
REMOTE_DIR="/var/www/domeforms-api"
LOCAL_SERVER_DIR="/home/paul/Documents/formCurator/packages/server/dist"
PACKAGE_JSON="/home/paul/Documents/formCurator/packages/server/package.json"

echo "========================================="
echo "   DomeForms Server Deployment"
echo "========================================="

# Step 1: Create remote directory
echo "[1/5] Creating remote directory..."
ssh ${VPS_USER}@${VPS_HOST} "sudo mkdir -p ${REMOTE_DIR}"

# Step 2: Copy server files
echo "[2/5] Copying server files..."
rsync -avz --progress "${LOCAL_SERVER_DIR}/" ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/

# Step 3: Copy package.json
echo "[3/5] Setting up package.json..."
cat > /tmp/package.json << 'PKGJSON'
{
  "name": "@domeforms/server",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.1164.0",
    "@aws-sdk/s3-request-presigner": "^3.1164.0",
    "@fastify/cookie": "^9.0.0",
    "@fastify/cors": "^9.0.1",
    "@fastify/helmet": "^11.1.1",
    "@fastify/jwt": "^8.0.1",
    "@fastify/rate-limit": "^9.1.0",
    "@fastify/sensible": "^5.6.0",
    "@fastify/swagger": "^8.14.0",
    "@fastify/swagger-ui": "^4.0.1",
    "bcryptjs": "^3.0.3",
    "better-auth": "^1.0.0",
    "dotenv": "^18.0.10",
    "fastify": "^4.28.1",
    "fastify-type-provider-zod": "^1.2.0",
    "prisma": "^6.8.2",
    "sqlite3": "^5.1.7",
    "stripe": "^23.1.0",
    "zod": "^3.23.8"
  }
}
PKGJSON
scp /tmp/package.json ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/package.json

# Step 4: Create .env file
echo "[4/5] Creating environment file..."
cat > /tmp/.env << 'ENVEOF'
NODE_ENV=production
PORT=3000
DATABASE_URL="file:${REMOTE_DIR}/data/domeforms.db"
DATABASE_TYPE=sqlite
BETTER_AUTH_SECRET="domeforms-production-secret-key-32chars-now"
BETTER_AUTH_URL="https://domeforms.frugalin.cloud"
FRONTEND_URL="https://domeforms.frugalin.cloud"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_FROM="noreply@domeforms.frugalin.cloud"
ENVEOF
scp /tmp/.env ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/

# Step 5: Install dependencies and start
echo "[5/5] Installing dependencies..."
ssh ${VPS_USER}@${VPS_HOST} "
  cd ${REMOTE_DIR} &&
  sudo mkdir -p data &&
  sudo chown \${USER}:\${USER} data &&
  npm install --omit=dev 2>&1 | tail -5 &&
  pm2 start index.js --name domeforms-api 2>/dev/null || node index.js &
"

# Update Nginx config
echo "Updating Nginx configuration..."
ssh ${VPS_USER}@${VPS_HOST} "
  sudo sed -i 's/proxy_pass http:\/\/127.0.0.1:3003;/proxy_pass http:\/\/127.0.0.1:3000;/' /etc/nginx/sites-available/domeforms.conf
  sudo nginx -t && sudo systemctl reload nginx
"

echo ""
echo "========================================="
echo "   Deployment Complete!"
echo "========================================="
echo ""
echo "Test with:"
echo "  curl http://127.0.0.1:3000/api/health"
echo "  curl https://domeforms.frugalin.cloud/api/health"
