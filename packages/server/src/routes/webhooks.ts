/**
 * Webhooks routes (public for receiving)
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@domeforms/database';
import crypto from 'crypto';
import { Prisma } from '@domeforms/database';
import { handleStripeWebhook } from '../services/payment.js';

const createWebhookSchema = z.object({
  formId: z.string().uuid(),
  name: z.string(),
  url: z.string().url(),
  secret: z.string().optional(),
  events: z.array(z.string()),
  enabled: z.boolean().default(true),
});

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function webhooksRoutes(fastify: FastifyInstance) {
  // Public endpoint for receiving webhooks (e.g., Stripe, PayPal)
  fastify.post('/receive/:formId', async (request, reply) => {
    const { formId } = request.params as { formId: string };
    const event = request.headers['x-event-type'] as string || 'unknown';
    
    // Find matching webhooks
    const webhooks = await prisma.webhook.findMany({
      where: { formId, enabled: true, events: { has: event } },
    });
    
    for (const webhook of webhooks) {
      // Verify signature if secret exists
      if (webhook.secret) {
        const signature = request.headers['x-signature'] as string;
        const payload = JSON.stringify(request.body);
        const expected = crypto.createHmac('sha256', webhook.secret).update(payload).digest('hex');
        if (signature !== expected) {
          continue; // Skip invalid signatures
        }
      }
      
      // Create delivery record
      await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event,
          payload: toPrismaJson(request.body),
          status: 'PENDING',
        },
      });
      
      // TODO: Actually deliver webhook (async job)
    }
    
    return { received: true, webhooks: webhooks.length };
  });

  // Stripe webhook endpoint (raw body required)
  fastify.post('/stripe', {
    preHandler: async (request, reply) => {
      // Disable body limit for raw stream processing
      reply.raw.setMaxListeners(0);
    },
  }, async (request, reply) => {
    const signature = request.headers['stripe-signature'] as string;
    
    if (!signature) {
      return reply.status(400).send({ error: 'Missing Stripe signature' });
    }

    // Collect raw body chunks
    let body = '';
    for await (const chunk of request.raw) {
      body += chunk;
    }

    try {
      await handleStripeWebhook(Buffer.from(body), signature);
      return { received: true };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });
  
  // Management endpoints (auth required)
  fastify.get('/', async (request, reply) => {
    const { formId } = request.query as { formId?: string };
    return prisma.webhook.findMany({ where: formId ? { formId } : {} });
  });
  
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    return prisma.webhook.findUnique({ where: { id }, include: { deliveries: { orderBy: { createdAt: 'desc' }, take: 20 } } });
  });
  
  fastify.post('/', async (request, reply) => {
    const data = createWebhookSchema.parse(request.body);
    return prisma.webhook.create({ data });
  });
  
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    return prisma.webhook.update({ 
      where: { id }, 
      data: { ...body, updatedAt: new Date() } 
    });
  });
  
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.webhook.delete({ where: { id } });
    return { success: true };
  });
}