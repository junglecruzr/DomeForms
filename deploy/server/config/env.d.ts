/**
 * Environment configuration with validation
 */
import 'dotenv/config';
export declare const env: {
    DATABASE_URL: string;
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    REDIS_URL: string;
    MINIO_ENDPOINT: string;
    MINIO_PORT: number;
    MINIO_ACCESS_KEY: string;
    MINIO_SECRET_KEY: string;
    MINIO_BUCKET: string;
    MINIO_USE_SSL: boolean;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_FROM: string;
    FRONTEND_URL: string;
    ADMIN_URL: string;
    DATABASE_TYPE?: "mariadb" | "postgresql" | "mysql" | "sqlite" | "sqlserver" | undefined;
    SMTP_USER?: string | undefined;
    SMTP_PASSWORD?: string | undefined;
    STRIPE_SECRET_KEY?: string | undefined;
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    SENDGRID_API_KEY?: string | undefined;
    MAILGUN_API_KEY?: string | undefined;
    TWILIO_ACCOUNT_SID?: string | undefined;
    TWILIO_AUTH_TOKEN?: string | undefined;
};
export declare const getDatabaseType: () => "postgresql" | "mysql" | "mariadb" | "sqlite" | "sqlserver";
export declare const getDatabasePort: () => number;
//# sourceMappingURL=env.d.ts.map