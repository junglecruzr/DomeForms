/**
 * DomeForms API Server
 * Fastify-based REST API with WebSocket support
 */

import Fastify from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';

import { env } from './config/env.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { authMiddleware } from './middleware/auth.js';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: env.NODE_ENV !== 'production' ? {
      target: 'pino-pretty',
      options: { colorize: true },
    } : undefined,
  },
}).withTypeProvider<ZodTypeProvider>();

// Core plugins
await fastify.register(helmet, {
  contentSecurityPolicy: false, // Allow CSP for embedding
});

await fastify.register(cookie, {
  secret: env.BETTER_AUTH_SECRET, // for signed cookies
  parseOptions: {}, // parse all cookies
});

await fastify.register(cors, {
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  hook: 'onRequest',
});

await fastify.register(sensible);

await fastify.register(jwt, {
  secret: env.BETTER_AUTH_SECRET,
  sign: { expiresIn: '7d' },
});

// Swagger documentation
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'DomeForms API',
      description: 'API for DomeForms - Drag and Drop Form Builder',
      version: '0.1.0',
    },
    servers: [{ url: `http://localhost:${env.PORT}`, description: 'Development' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
});

await fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: { docExpansion: 'list', deepLinking: true },
});

// Error handling
fastify.setErrorHandler(errorHandler);

// Auth middleware
await fastify.register(authMiddleware);

// Routes
await registerRoutes(fastify);

// Health check
fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    fastify.log.info(`🚀 Server running on http://localhost:${env.PORT}`);
    fastify.log.info(`📚 API Docs: http://localhost:${env.PORT}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

export { fastify };