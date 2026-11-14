/**
 * Environment configuration with validation
 */
import 'dotenv/config';
import { z } from 'zod';
const DATABASE_URL = process.env.DATABASE_URL || '';
const isMySQL = DATABASE_URL.startsWith('mysql://');
const isMariaDB = DATABASE_URL.startsWith('mariadb://') || DATABASE_URL.startsWith('mysql://') && process.env.DATABASE_TYPE === 'mariadb';
const isSQLite = DATABASE_URL.startsWith('sqlite://');
const isSQLServer = DATABASE_URL.startsWith('sqlserver://') || DATABASE_URL.startsWith('mssql://');
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    // Database URL supports PostgreSQL, MySQL, MariaDB, SQLite, and SQL Server
    DATABASE_URL: z.string().min(1),
    // Database type detection (postgresql, mysql, mariadb, sqlite, sqlserver)
    DATABASE_TYPE: z.enum(['postgresql', 'mysql', 'mariadb', 'sqlite', 'sqlserver']).optional(),
    REDIS_URL: z.string().url().default('redis://localhost:6379'),
    MINIO_ENDPOINT: z.string().default('localhost'),
    MINIO_PORT: z.coerce.number().default(9000),
    MINIO_ACCESS_KEY: z.string().default('minioadmin'),
    MINIO_SECRET_KEY: z.string().default('minioadmin'),
    MINIO_BUCKET: z.string().default('domeforms'),
    MINIO_USE_SSL: z.coerce.boolean().default(false),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),
    SMTP_HOST: z.string().default('localhost'),
    SMTP_PORT: z.coerce.number().default(1025),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().email().default('noreply@domeforms.local'),
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),
    ADMIN_URL: z.string().url().default('http://localhost:5174'),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),
    MAILGUN_API_KEY: z.string().optional(),
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
});
export const env = envSchema.parse(process.env);
// Auto-detect database type if not explicitly set
export const getDatabaseType = () => {
    if (env.DATABASE_TYPE)
        return env.DATABASE_TYPE;
    if (isSQLite)
        return 'sqlite';
    if (isSQLServer)
        return 'sqlserver';
    if (isMariaDB)
        return 'mariadb';
    if (isMySQL)
        return 'mysql';
    return 'postgresql';
};
// Get database port based on type
export const getDatabasePort = () => {
    const dbType = getDatabaseType();
    switch (dbType) {
        case 'postgresql': return 5432;
        case 'mysql':
        case 'mariadb': return 3306;
        case 'sqlite': return 0; // File-based, no port
        case 'sqlserver': return 1433;
        default: return 5432;
    }
};
//# sourceMappingURL=env.js.map