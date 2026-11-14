/**
 * Integrations routes
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@domeforms/database';
import { Prisma } from '@domeforms/database';

const createIntegrationSchema = z.object({
  formId: z.string().uuid(),
  type: z.enum(['EMAIL', 'WEBHOOK', 'ZAPIER', 'MAILCHIMP', 'HUBSPOT', 'SALESFORCE', 'ACTIVECAMPAIGN', 'CONVERTKIT', 'STRIPE', 'PAYPAL', 'TWILIO', 'CUSTOM']),
  name: z.string(),
  config: z.record(z.unknown()),
  mapping: z.array(z.object({ formFieldId: z.string(), integrationField: z.string(), transform: z.string().optional() })),
  enabled: z.boolean().default(true),
  runOn: z.string().default('submit'),
});

function toPrismaJson(value: Record<string, unknown>): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function integrationsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const { formId } = request.query as { formId?: string };
    return prisma.integration.findMany({ where: formId ? { formId } : {}, include: { logs: { take: 5, orderBy: { createdAt: 'desc' } } } });
  });
  
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    return prisma.integration.findUnique({ where: { id }, include: { logs: { orderBy: { createdAt: 'desc' } } } });
  });
  
  fastify.post('/', async (request, reply) => {
    const data = createIntegrationSchema.parse(request.body);
    return prisma.integration.create({ 
      data: {
        ...data,
        config: toPrismaJson(data.config),
        mapping: data.mapping as Prisma.InputJsonValue,
      }
    });
  });
  
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    return prisma.integration.update({ 
      where: { id }, 
      data: { 
        ...body, 
        config: body.config ? toPrismaJson(body.config as Record<string, unknown>) : undefined,
        mapping: body.mapping as Prisma.InputJsonValue | undefined,
        updatedAt: new Date() 
      } 
    });
  });
  
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.integration.delete({ where: { id } });
    return { success: true };
  });
  
  fastify.post('/:id/test', async (request, reply) => {
    // Test integration endpoint
    return { success: true, message: 'Integration test triggered' };
  });
}