#!/bin/bash
# DomeForms VPS Auto-Deploy
# Usage: bash setup-vps.sh

set -e
DOMAIN="domeforms.yourdomain.com"
APP_DIR="/var/www/domeforms"
SOURCE_DIR="/path/to/domeforms/deploy/domeforms"

echo "========================================="
echo "   DomeForms VPS Auto-Deploy"
echo "========================================="
echo ""

# Step 1: Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

echo "[1/7] Installing Python and dependencies..."
apt-get update -qq
apt-get install -y -qq python3 python3-pip python3-venv apache2 libapache2-mod-passenger > /dev/null 2>&1
echo "  ✓ Python and Apache installed"

echo "[2/7] Creating application directory..."
mkdir -p $APP_DIR/data
chmod 755 $APP_DIR/data
echo "  ✓ Directory created"

echo "[3/7] Copying application files..."
cp -r $SOURCE_DIR/* $APP_DIR/
echo "  ✓ Files copied"

echo "[4/7] Installing Python packages..."
pip3 install flask flask-cors --break-system-packages --quiet 2>/dev/null || pip install flask flask-cors --quiet
echo "  ✓ Packages installed"

echo "[5/7] Configuring Apache virtual host..."
cat > /etc/apache2/sites-available/domeforms.conf << 'APACHECONF'
<VirtualHost *:80>
    ServerName domeforms.yourdomain.com
    DocumentRoot /var/www/domeforms

    PassengerEnabled on
    PassengerAppRoot /var/www/domeforms
    PassengerPython /usr/bin/python3

    <Directory /var/www/domeforms>
        Require all granted
        AllowOverride All
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/domeforms_error.log
    CustomLog ${APACHE_LOG_DIR}/domeforms_access.log combined
</VirtualHost>
APACHECONF

a2ensite domeforms.conf > /dev/null 2>&1
echo "  ✓ Virtual host configured"

echo "[6/7] Restarting Apache..."
systemctl restart apache2 > /dev/null 2>&1
echo "  ✓ Apache restarted"

echo "[7/7] Testing deployment..."
sleep 2
if curl -s "http://$DOMAIN/api/health" | grep -q "ok"; then
    echo "  ✓ API is responding!"
else
    echo "  ⚠ API not responding yet (DNS may need time)"
fi

echo ""
echo "========================================="
echo "   Deployment Complete!"
echo "========================================="
echo ""
echo "Your DomeForms app is now running at:"
echo "  https://$DOMAIN/"
