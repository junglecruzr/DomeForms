# DomeForms Deployment — frugin.com (Customized)

## Your Hosting Details
- **Domain**: frugin.com
- **Package**: Blaze (Autoscaling Linux)
- **Home Path**: `/var/www/`
- **Email**: smtp.stackmail.com / imap.stackmail.com

---

## Quick Start (5 Minutes)

### Step 1: Build Locally

On your computer, navigate to the project and run:

```bash
cd /path/to/domeforms
corepack pnpm install
mkdir -p data

# Create production config for frugin.com
cat > packages/server/.env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL="file:/var/www/domeforms/data/domeforms.db"
DATABASE_TYPE=sqlite
BETTER_AUTH_SECRET="YOUR_RANDOM_32_CHAR_SECRET_HERE_CHANGE_THIS_NOW"
BETTER_AUTH_URL="https://frugin.com"
FRONTEND_URL="https://frugin.com"
SMTP_HOST="smtp.stackmail.com"
SMTP_PORT=587
SMTP_FROM="noreply@frugin.com"
EOF

# Build everything
corepack pnpm build
```

### Step 2: Upload to Your Server

Upload these folders to `/var/www/domeforms/`:
- `dist/` (from packages/server/dist)
- `data/` (empty folder)
- `.env` (the file you just created)

### Step 3: Create Node.js App in cPanel

1. Go to **cPanel → Setup Node.js App**
2. Click **Create Application**
3. Fill in:
   - Node.js version: **v20.x**
   - Application root: `/public_html/forms`
   - Application URL: `https://frugin.com`
   - Startup file: `dist/index.js`
4. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=3000`
5. Click **Create**

### Step 4: Initialize Database

**If you have SSH:**
```bash
cd /var/www/domeforms
chmod 755 data
touch data/domeforms.db
chmod 666 data/domeforms.db
node -e "require('./node_modules/.prisma/client').PrismaClient().$connect().then(()=>console.log('Connected!'))"
```

**If NO SSH:** The database creates automatically on first visit. Just wait.

### Step 5: Visit Your Site

Go to **https://frugin.com**

You should see:
- Login page at `/login`
- Form Builder interface
- API docs at `/api/docs`

---

## If You Get Stuck

| Problem | Fix |
|---------|-----|
| White screen | Check cPanel logs → click "Logs" button next to your app |
| Database errors | Run: `chmod 666 /var/www/domeforms/data/domeforms.db` |
| Can't login | First registration creates admin account automatically |
| Slow loading | Add caching .htaccess (see below) |

### Performance (.htaccess)

Create `/var/www/domeforms/.htaccess`:
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

---

## Email Setup (StackMail)

Your host uses StackMail. Update `.env`:
```env
SMTP_HOST=smtp.stackmail.com
SMTP_PORT=587
SMTP_USER="yourname@frugin.com"
SMTP_PASSWORD="your_email_password"
SMTP_FROM="noreply@frugin.com"
```

---

## Next Steps

1. ✅ Visit https://frugin.com/login
2. ✅ Register your admin account
3. ✅ Create your first form
4. ✅ Test a submission

Need help? Contact your host's support or check cPanel logs.


This guide shows you how to deploy DomeForms on any web hosting environment **without Docker**. Choose the option that matches your setup.

---

## Quick Comparison

| Hosting Type | Best For | Complexity | Cost |
|--------------|----------|------------|------|
| **SQLite + Static Host** | Simple forms, personal projects | ⭐ Easy | Free |
| **VPS with PostgreSQL** | Production apps, high traffic | ⭐⭐ Medium | $5-20/mo |
| **Cloud DB (PlanetScale)** | Scalable production, managed | ⭐ Easy | Free-$10/mo |
| **Railway/Render** | Full stack managed deployment | ⭐⭐ Medium | Pay-per-use |

---

## Prerequisites (All Options)

```bash
# Must have Node.js v20+ installed
node --version  # Should show v20.x.x or higher

# Must have pnpm installed
corepack enable
pnpm --version
```

If not installed:
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Enable corepack and pnpm
corepack enable
corepack prepare pnpm@latest --activate
```

---

## Option A: SQLite Deployment (Simplest - Zero Database Setup)

Perfect for shared hosting, Netlify, Vercel, or simple VPS setups.

### Step 1: Prepare the Environment

```bash
cd /path/to/formcurator

# Install dependencies
corepack pnpm install

# Create data directory for SQLite
mkdir -p data
```

### Step 2: Configure .env

Create `packages/server/.env`:

```env
NODE_ENV=production
PORT=3000

# SQLite database - no server needed!
DATABASE_URL="file:./data/domeforms.db"
DATABASE_TYPE=sqlite

# Redis optional - use if you have it, otherwise remove
REDIS_URL="redis://localhost:6379"

# Authentication secret - generate a random 32+ character string
BETTER_AUTH_SECRET="your_random_secret_at_least_32_characters_long_abc123"
BETTER_AUTH_URL="https://yourdomain.com"

# Email settings
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="noreply@yourdomain.com"

# Frontend URL
FRONTEND_URL="https://yourdomain.com"

# Stripe (optional - for payment forms)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Step 3: Generate Database Schema

```bash
# Generate Prisma client for SQLite
corepack pnpm db:generate

# Apply schema to SQLite file
corepack pnpm db:push
```

### Step 4: Build Everything

```bash
# Build all packages
corepack pnpm build
```

### Step 5: Start the Server

```bash
# Run the backend server
cd packages/server
node dist/index.js
```

Or in background:
```bash
nohup node dist/index.js > server.log 2>&1 &
```

---

## Option B: Cloud Database (PlanetScale - MySQL Compatible)

Best for scalable production without managing servers. Uses MySQL-compatible engine.

### Step 1: Create Free Database

1. Go to [planetscale.com](https://planetscale.com)
2. Sign up free
3. Create new database: `domeforms`
4. Click "Connect" -> "Node.js" and copy connection string

### Step 2: Configure .env

```env
NODE_ENV=production
PORT=3000

# PlanetScale connection string (replace with yours)
DATABASE_URL="mysql://username:password@hostname.dmlayers.com/domeforms?sslaccept=strict"
DATABASE_TYPE=mysql

BETTER_AUTH_SECRET="your_random_32_char_secret_here_xyz"
BETTER_AUTH_URL="https://yourdomain.com"

FRONTEND_URL="https://yourdomain.com"
SMTP_FROM="noreply@yourdomain.com"
```

### Step 3: Deploy

```bash
# Install
corepack pnpm install

# Generate and push schema (runs migrations automatically)
corepack pnpm db:generate
corepack pnpm db:push

# Build
corepack pnpm build
```

### Step 4: Start Server

```bash
cd packages/server
node dist/index.js
```

---

## Option C: VPS Deployment (PostgreSQL or MySQL)

For full control on a Virtual Private Server (DigitalOcean, Linode, AWS EC2).

### Step 1: Install Database on VPS

#### PostgreSQL (Recommended)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Create database and user
sudo -u postgres psql
CREATE DATABASE domeforms;
CREATE USER domeforms WITH PASSWORD 'secure_password';
ALTER ROLE domeforms SET client_encoding TO 'utf8';
ALTER ROLE domeforms SET default_transaction_isolation TO 'read committed';
ALTER ROLE domeforms SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE domeforms TO domeforms;
\q
```

#### MySQL/MariaDB
```bash
# Ubuntu/Debian
sudo apt install mysql-server -y

# Secure installation
sudo mysql_secure_installation

# Create database
sudo mysql -u root -p
CREATE DATABASE domeforms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'domeforms'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON domeforms.* TO 'domeforms'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2: Configure Application

```bash
# Clone/project setup
cd /path/to/formcurator
corepack pnpm install

# Create .env
cat > packages/server/.env << 'EOF'
NODE_ENV=production
PORT=3000

# PostgreSQL example
DATABASE_URL="postgresql://domeforms:secure_password@localhost:5432/domeforms?schema=public"
DATABASE_TYPE=postgresql

# MySQL example
# DATABASE_URL="mysql://domeforms:secure_password@localhost:3306/domeforms"
# DATABASE_TYPE=mysql

BETTER_AUTH_SECRET="your_32_character_random_string_generated_now"
BETTER_AUTH_URL="https://yourdomain.com"
FRONTEND_URL="https://yourdomain.com"
SMTP_FROM="noreply@yourdomain.com"
EOF

# Initialize database
corepack pnpm db:generate
corepack pnpm db:push

# Build
corepack pnpm build
```

### Step 3: Install PM2 (Process Manager)

```bash
# Global install
corepack pnpm add -g pm2

# Start server with PM2
cd packages/server
pm2 start dist/index.js --name domeforms-api
pm2 save
pm2 startup systemd  # Follow the output command to auto-start on boot
```

### Step 4: Setup Nginx Reverse Proxy

```bash
sudo apt install nginx -y

sudo tee /etc/nginx/sites-available/domeforms << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # API proxy
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

    # Builder app
    location / {
        root /path/to/formcurator/apps/builder-app/dist;
        try_files $uri $uri/ /index.html;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/domeforms /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Step 5: SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Option D: Managed Platforms (Easiest)

### Railway.app (Recommended)

1. Push your code to GitHub
2. Connect repo at [railway.app](https://railway.app)
3. Add environment variables from `.env`
4. Railway auto-detects Node.js and builds
5. Get your free subdomain or connect custom domain

Set these vars in Railway dashboard:
- `DATABASE_URL` (use Railway's managed PostgreSQL or link PlanetScale)
- `BETTER_AUTH_SECRET`
- `FRONTEND_URL`

### Render.com

Similar to Railway but uses `render.yaml`:

```yaml
services:
  - type: web
    name: domeforms-api
    env: node
    buildCommand: corepack pnpm install && corepack pnpm build
    startCommand: cd packages/server && node dist/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: domeforms-db
          property: connectionString
```

Add a Postgres database from Render dashboard, then deploy.

### Vercel (Frontend Only)

Vercel is great for the frontend builder app:
- Deploy `apps/builder-app` to Vercel
- Set API URLs to your backend (Railway/Render self-hosted)

---

## File Structure After Build

```
formcurator/
├── data/                      # SQLite database (if using SQLite)
│   └── domeforms.db
├── packages/
│   ├── server/
│   │   ├── dist/              # Built server code
│   │   ├── src/               # Source code
│   │   └── .env               # Your config
│   ├── builder-app/
│   │   ├── dist/              # Built frontend
│   │   └── src/               # Source code
│   └── ...
├── pnpm-lock.yaml
└── package.json
```

---

## Essential PM2 Commands

```bash
# Start all services
pm2 start packages/server/dist/index.js --name api

# View logs
pm2 logs api

# Restart after updates
pm2 restart api

# Stop
pm2 stop api

# Auto-start on reboot
pm2 save
pm2 startup
```

---

## Troubleshooting

### SQLite Issues
- **Error: Unable to acquire connection**: Check `data/` folder permissions
  ```bash
  chmod 755 data
  chmod 644 data/domeforms.db
  ```

### Permission Errors
```bash
# Ensure proper ownership
chown -R $USER:$USER /path/to/formcurator
chmod -R 755 /path/to/formcurator/packages/server/dist
```

### Port Already in Use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or change PORT in .env
PORT=3001
```

### Can't Connect to Database
- **SQLite**: Verify path is correct and directory exists
- **Remote DB**: Check firewall rules allow your server IP
- **Credentials**: Double-check username/password in DATABASE_URL

---

## Security Checklist

- [ ] Change `BETTER_AUTH_SECRET` to a unique random string (32+ chars)
- [ ] Use strong database passwords
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set `NODE_ENV=production`
- [ ] Configure rate limiting (already enabled by default)
- [ ] Keep `prisma` updated: `corepack pnpm db:migrate` when schema changes

---

## Next Steps After Deployment

1. Visit your admin URL: `https://yourdomain.com/login`
2. Register your first admin account
3. Create your first form in the builder
4. Test submission endpoint:
   ```bash
   curl -X POST https://yourdomain.com/api/submissions/public \
     -H "Content-Type: application/json" \
     -d '{"formId":"YOUR_FORM_ID","data":{"email":"test@example.com"}}'
   ```

---

Need help? The installer (`./install.sh`) can still be used with the SQLite option selected, which handles most of this automatically.
