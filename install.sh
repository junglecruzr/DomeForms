#!/bin/bash
set -e

echo "========================================="
echo "   DomeForms Self-Hosted Installer      "
echo "========================================="

# Database selection prompt
echo ""
echo "Select database type:"
echo "  1) PostgreSQL (default/recommended)"
echo "  2) MySQL"
echo "  3) MariaDB"
echo "  4) SQLite (local development only)"
echo "  5) SQL Server"
read -p "Enter choice [1]: " db_choice
db_choice=${db_choice:-1}

case $db_choice in
    1)
        DB_TYPE="postgresql"
        DB_PORT="5432"
        DB_USER="postgres"
        DB_PASS="postgres"
        DB_NAME="domeforms"
        ;;
    2)
        DB_TYPE="mysql"
        DB_PORT="3306"
        DB_USER="domeforms"
        DB_PASS="domeforms"
        DB_NAME="domeforms"
        ;;
    3)
        DB_TYPE="mariadb"
        DB_PORT="3307"
        DB_USER="domeforms"
        DB_PASS="domeforms"
        DB_NAME="domeforms"
        ;;
    4)
        DB_TYPE="sqlite"
        DB_PORT="0"
        DB_FILE="domeforms.db"
        ;;
    5)
        DB_TYPE="sqlserver"
        DB_PORT="1433"
        DB_USER="sa"
        DB_PASS="DomeForms@2024!"
        DB_NAME="domeforms"
        ;;
    *)
        echo "Invalid choice, defaulting to PostgreSQL..."
        DB_TYPE="postgresql"
        DB_PORT="5432"
        DB_USER="postgres"
        DB_PASS="postgres"
        DB_NAME="domeforms"
        ;;
esac

echo "--> Using $DB_TYPE database"
if [ "$DB_TYPE" != "sqlite" ]; then
    echo "--> Port: $DB_PORT"
fi

# 1. Check Prerequisites
echo ""
echo "--> Checking system prerequisites..."

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js v20+ and retry."
    exit 1
fi

if ! command -v corepack &> /dev/null; then
    echo "Warning: corepack not found. Ensuring pnpm is available..."
    if ! command -v pnpm &> /dev/null; then
        echo "Error: Neither corepack nor pnpm found. Please install pnpm."
        exit 1
    fi
else
    corepack enable
fi

echo "✔ Prerequisites met."

# 2. Environment Configuration
echo "--> Setting up environment files..."
DATABASE_URL=""

if [ "$DB_TYPE" = "sqlite" ]; then
    DATABASE_URL="file:./data/domeforms.db"
    mkdir -p data
elif [ "$DB_TYPE" = "sqlserver" ]; then
    DATABASE_URL="sqlserver://localhost:$DB_PORT;database=$DB_NAME;username=$DB_USER;password=$DB_PASS;trustServerCertificate=true;encrypt=false"
else
    DATABASE_URL="$DB_TYPE://$DB_USER:$DB_PASS@localhost:$DB_PORT/$DB_NAME?schema=public"
fi

if [ ! -f "packages/server/.env" ]; then
    if [ -f "packages/server/.env.example" ]; then
        cp packages/server/.env.example packages/server/.env
    else
        cat <<EOT > packages/server/.env
NODE_ENV=production
PORT=3000
DATABASE_URL="$DATABASE_URL"
DATABASE_TYPE=$DB_TYPE
REDIS_URL="redis://localhost:6379"
BETTER_AUTH_SECRET="a_random_32_character_secret_string_here_12345"
FRONTEND_URL="http://localhost:5173"
EOT
    fi
    
    # Update DATABASE_URL in .env
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" packages/server/.env
    sed -i "s|DATABASE_TYPE=.*|DATABASE_TYPE=$DB_TYPE|" packages/server/.env
    echo "Created packages/server/.env with $DB_TYPE configuration."
fi

# 3. Infrastructure Setup via Docker (skip for SQLite)
echo "--> Starting infrastructure (Docker)..."
if [ "$DB_TYPE" = "sqlite" ]; then
    docker-compose up -d redis mailhog
else
    case $DB_TYPE in
        postgresql) docker-compose up -d postgres redis mailhog ;;
        mysql) docker-compose up -d mysql redis mailhog ;;
        mariadb) docker-compose up -d mariadb redis mailhog ;;
        sqlserver) docker-compose up -d sqlserver redis mailhog ;;
    esac
fi

# Wait for database to be ready
echo "--> Waiting for database to be ready..."
if [ "$DB_TYPE" = "sqlite" ]; then
    echo "SQLite uses local file, skipping container check."
elif [ "$DB_TYPE" = "mysql" ]; then
    for i in $(seq 1 30); do
        if docker exec domeforms-mysql mysqladmin ping -h localhost -udomeforms -pdomeforms --silent &>/dev/null; then
            echo "MySQL is ready!"
            break
        fi
        sleep 1
    done
elif [ "$DB_TYPE" = "mariadb" ]; then
    for i in $(seq 1 30); do
        if docker exec domeforms-mariadb mysqladmin ping -h localhost -udomeforms -pdomeforms --silent &>/dev/null; then
            echo "MariaDB is ready!"
            break
        fi
        sleep 1
    done
elif [ "$DB_TYPE" = "sqlserver" ]; then
    for i in $(seq 1 30); do
        if docker exec domeforms-sqlserver bash -c "printf %s >/dev/tcp/localhost/1433" &>/dev/null; then
            echo "SQL Server is ready!"
            break
        fi
        sleep 1
    done
else
    for i in $(seq 1 30); do
        if docker exec domeforms-postgres pg_isready -U postgres &>/dev/null; then
            echo "PostgreSQL is ready!"
            break
        fi
        sleep 1
    done
fi

# 4. Install Dependencies
echo "--> Installing project dependencies..."
corepack pnpm install

# 5. Database Migration & Generation
echo "--> Running database migrations..."
corepack pnpm db:generate
corepack pnpm db:push

# 6. Build Packages and Apps
echo "--> Building DomeForms packages and applications..."
corepack pnpm build

echo "========================================="
echo "   DomeForms Installation Complete!     "
echo "========================================="
echo ""
echo "Database: $DB_TYPE"
if [ "$DB_TYPE" != "sqlite" ]; then
    echo "Port: $DB_PORT"
else
    echo "File: data/domeforms.db"
fi
echo ""
echo "To start the application:"
echo "  1. Start Backend Server: corepack pnpm --dir packages/server start"
echo "  2. Start Builder Frontend: corepack pnpm --dir apps/builder-app preview"
echo ""
echo "API Docs will be available at: http://localhost:3000/docs"
echo "Builder App available at: http://localhost:5173"
echo "========================================="
