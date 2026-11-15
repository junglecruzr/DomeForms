#!/bin/bash
# Simple deployment using direct rsync
cd /path/to/domeforms

# Create package.json for the server
cat > packages/server/dist/package.json << 'PKGJSON'
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

echo "Created package.json for deployment"
echo "Run: ./deploy-server.sh"
