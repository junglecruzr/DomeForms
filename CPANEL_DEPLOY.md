# DomeForms Deployment Guide — cPanel / Shared Hosting

This guide shows you how to deploy DomeForms on **cPanel shared hosting** (like your server at cp.serverbyt.net). No root access or Docker required.

---

## Prerequisites for cPanel

Before deploying, verify these are available in your cPanel:

### 1. Enable Node.js Application
In cPanel, find **"Setup Node.js App"** (or "Process Manager" / "MultiPHP Manager") and ensure:
- ✅ Node.js version 20.x is available
- ✅ You can create a new application

### 2. File Access
You'll need either:
- **File Manager** in cPanel (for uploading files)
- **FTP/SFTP** credentials
- **SSH access** (if available — preferred but not required)

### 3. Domain Configuration
Decide where your app will live:
- Main domain: `yourdomain.com`
- Subdomain: `app.yourdomain.com`
- Alias: `forms.yourdomain.com`

---

## Method 1: SQLite + Node.js App (Recommended for cPanel)

This method uses SQLite (file-based database) so you don't need an external database.

### Step 1: Prepare Your Local Files

On your local machine (not the server), prepare the build:

```bash
# Clone or navigate to your project
cd /home/paul/Documents/formCurator

# Install dependencies
corepack pnpm install

# Create data directory
mkdir -p data

# Configure for production with SQLite
# IMPORTANT: Replace username with your actual cPanel username!
cat > packages/server/.env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL="file:/home/username/public_html/forms/data/domeforms.db"
DATABASE_TYPE=sqlite
BETTER_AUTH_SECRET="generate_a_random_32_character_string_here_xyz"
BETTER_AUTH_URL="https://forms.yourdomain.com"
FRONTEND_URL="https://forms.yourdomain.com"
SMTP_FROM="noreply@yourdomain.com"
EOF

# Build everything
corepack pnpm build
```

### Step 2: Upload to cPanel

Using **File Manager** or **FTP**:

1. Navigate to where you want the app (e.g., `~/public_html/forms/`)
2. Upload these folders/files from your built project:
   ```
   ├── dist/                    # From packages/server/dist
   ├── data/                    # Empty directory for SQLite
   └── .env                     # Your environment file
   ```

Important: Only upload the **built/dist** files, not the entire source code.

### Step 3: Create Node.js Application in cPanel

1. Go to **"Setup Node.js App"** in cPanel
2. Click **"Create Application"**
3. Configure:
   - **Node.js version**: v20.0 (or latest available)
   - **Application root**: `/public_html/forms`
   - **Application URL**: `https://forms.yourdomain.com`
   - **Application startup file**: `dist/index.js`
   - **Application command**: `node` (leave blank if using startup file)
   - **Pass environment variables**: Add your vars from `.env`
     - `NODE_ENV=production`
     - `PORT=3000`

4. Click **Create** — cPanel will start your app
5. Note the **PID file path** and **log file path** for later

### Step 4: Initialize Database

Access your server via SSH (if available) or create a temporary script:

**Via SSH:**
```bash
cd ~/public_html/forms
corepack pnpm db:generate
corepack pnpm db:push
```

**Without SSH — Use a Temporary Script:**
Create `setup-db.js` in your app root:
```javascript
const { execSync } = require('child_process');
try {
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database initialized!');
} catch (e) {
  console.error('❌ Error:', e.message);
}
```

Run this by visiting: `https://forms.yourdomain.com/setup-db.js` (if your host allows it) or via terminal.

### Step 5: Verify It Works

Visit `https://forms.yourdomain.com` — you should see:
- Builder login page
- API documentation at `/api/docs`

Test the API:
```bash
curl https://forms.yourdomain.com/api/health
```

Expected response: `{"status":"ok","timestamp":"..."}`

---

## Method 2: External Database (PlanetScale + cPanel)

If your hosting doesn't support Node.js well, use PlanetScale for the database and keep DomeForms lightweight.

### Step 1: Create Free Database

1. Go to [planetscale.com](https://planetscale.com)
2. Sign up → Create organization → New database: `domeforms`
3. Click database name → **Connect** → Copy **Node.js** connection string

### Step 2: Deploy to cPanel

Same as Method 1, but update `.env`:
```env
DATABASE_URL="mysql://user:pass@hostname.psdb.cloud/domeforms?sslaccept=strict"
DATABASE_TYPE=mysql
REDIS_URL=""  # Optional: remove if no Redis
```

### Step 3: Set Up in cPanel

Follow steps 2-5 from Method 1. The rest is identical.

---

## Method 3: Hybrid Approach (Easiest)

Deploy only the **form rendering** on your site, manage forms externally.

### How It Works
- Forms are built/managed in a hosted DomeForms instance (Railway.app free tier)
- Embed forms on your cPanel site using JavaScript snippet
- No server configuration needed on cPanel

### Steps

1. **Host DomeForms on Railway.app** (free):
   - Connect GitHub repo
   - Deploy automatically
   - Get your API URL

2. **Embed forms on your cPanel site**:
   ```html
   <!-- In any HTML file on your cPanel site -->
   <script src="https://your-domeforms-railway.app/embed.js"></script>
   <div id="form-container" data-form-id="YOUR_FORM_UUID"></div>
   <script>window.initDomeForms('form-container');</script>
   ```

3. That's it! All form processing happens on Railway.

---

## Troubleshooting Common cPanel Issues

### Issue: App Won't Start
**Check logs:**
- cPanel → Node.js App → Click "Logs" button
- Or check `~/logs/nodejs/` via File Manager

Common fixes:
```bash
# Ensure all dependencies are installed
cd ~/public_html/forms
npm install --production

# Check port is free
lsof -i :3000
```

### Issue: Database Permission Errors (SQLite)
```bash
# Fix permissions
chmod 755 ~/public_html/forms/data
chmod 644 ~/public_html/forms/data/domeforms.db

# Or recreate
rm ~/public_html/forms/data/domeforms.db
touch ~/public_html/forms/data/domeforms.db
chmod 666 ~/public_html/forms/data/domeforms.db
```

### Issue: CORS/HTTPS Problems
Add to your cPanel Node.js environment variables:
```
CORS_ORIGIN=https://forms.yourdomain.com
FRONTEND_URL=https://forms.yourdomain.com
```

### Issue: Max Execution Time
Some shared hosts kill long-running processes. Check with host if they support:
- Long-running Node.js processes
- WebSockets (for real-time features)

---

## Security Notes for cPanel

1. **Never commit `.env` to Git** — add to `.gitignore`
2. **Use strong secrets** — generate with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Enable HTTPS** — most cPanels offer Let's Encrypt free SSL
4. **Backup your SQLite file** regularly:
   ```bash
   cp ~/public_html/forms/data/domeforms.db ~/backups/domeforms-$(date +%Y%m%d).db
   ```

---

## Performance Tips

cPanel shared hosting has limitations. Optimize by:

1. **Use HTTPS** — Required for security headers
2. **Enable Gzip** — Already configured in our build
3. **Minify responses** — Use a CDN if possible
4. **Cache static assets** — Set expiry in `.htaccess`:
   ```apache
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType application/javascript "access plus 1 year"
     ExpiresByType text/css "access plus 1 year"
     ExpiresByType image/svg+xml "access plus 1 year"
   </IfModule>
   ```

---

## Need More Help?

Common questions:
- **Q: My host doesn't support Node.js?** → Use Method 3 (Hybrid approach)
- **Q: Can I use WordPress?** → Yes! Embed forms via shortcode after setup
- **Q: What about email notifications?** → Use SendGrid/Mailgun API keys instead of SMTP

Your cPanel provides File Manager, SSH (if enabled), and cron jobs — all useful for maintenance.

---

## Quick Reference Checklist

- [ ] Node.js 20+ available in cPanel
- [ ] .env configured with correct paths
- [ ] dist/ folder uploaded
- [ ] data/ folder created and writable
- [ ] Node.js app created in cPanel
- [ ] Database initialized (prisma db push)
- [ ] HTTPS enabled
- [ ] App tested and working

---

**Ready to deploy?** Follow Method 1 step-by-step above, or use our automated installer with SQLite option if you have SSH access.
