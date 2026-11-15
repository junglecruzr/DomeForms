#!/bin/bash
# Build and deploy DomeForms server
set -e

cd "$(dirname "$0")"

# Build the server package
echo "Building server..."
pnpm --filter @domeforms/server build

# Create tarball
echo "Creating deployment package..."
tar -czf /tmp/domeforms-deploy.tar.gz packages/server/dist/

echo "Done! Upload with: scp /tmp/domeforms-deploy.tar.gz root@your-vps-ip:/tmp/"
