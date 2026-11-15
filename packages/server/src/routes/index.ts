/**
 * Route registration
 */

import { FastifyInstance } from 'fastify';
import { formsRoutes } from './forms.js';
import { submissionsRoutes } from './submissions.js';
import { themesRoutes } from './themes.js';
import { integrationsRoutes } from './integrations.js';
import { webhooksRoutes } from './webhooks.js';
import { analyticsRoutes } from './analytics.js';
import { authRoutes } from './auth.js';
import { uploadRoutes } from './upload.js';
import { paymentsRoutes } from './payments.js';

export async function registerRoutes(fastify: FastifyInstance) {
  // Public routes (no auth required)
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(formsRoutes, { prefix: '/api/forms' });
  await fastify.register(submissionsRoutes, { prefix: '/api/submissions' });
  await fastify.register(webhooksRoutes, { prefix: '/api/webhooks' });
  await fastify.register(uploadRoutes, { prefix: '/api/upload' });
  await fastify.register(paymentsRoutes, { prefix: '/api/payments' });
  
  // Protected routes (auth required)
  await fastify.register(themesRoutes, { prefix: '/api/themes' });
  await fastify.register(integrationsRoutes, { prefix: '/api/integrations' });
  await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });
}