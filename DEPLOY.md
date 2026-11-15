# DomeForms Deployment Instructions

## Upload the Server

Run this command from your LOCAL terminal (not the VPS):

```bash
scp domeforms-server.tar.gz root@your-vps-ip:/tmp/
```

Or copy manually via Hostinger File Manager.

## On the VPS, run:

```bash
# Extract
cd /var/www/domeforms-api
tar -xzf /tmp/domeforms-server.tar.gz --strip-components=2

# Create .env
sudo tee .env > /dev/null << 'ENVEOF'
NODE_ENV=production
PORT=3000
DATABASE_URL="file:./data/domeforms.db"
DATABASE_TYPE=sqlite
BETTER_AUTH_SECRET="domeforms-production-secret-key-32chars-now"
BETTER_AUTH_URL="https://domeforms.yourdomain.com"
FRONTEND_URL="https://domeforms.yourdomain.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_FROM="noreply@domeforms.yourdomain.com"
ENVEOF

# Install dependencies
npm install --production

# Start with PM2
pm2 start index.js --name domeforms-api
pm2 save
pm2 startup

# Update Nginx
sudo sed -i 's/proxy_pass http:\/\/127.0.0.1:3003;/proxy_pass http:\/\/127.0.0.1:3000;/' /etc/nginx/sites-available/domeforms.conf
sudo nginx -t && sudo systemctl reload nginx

# Test
curl http://127.0.0.1:3000/api/health
```
