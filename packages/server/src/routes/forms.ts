/**
 * Forms routes - basic CRUD
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@domeforms/database';

const createFormSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  workspaceId: z.string().uuid(),
  themeId: z.string().uuid().optional(),
});

export async function formsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const { workspaceId, status, page = 1, limit = 20 } = request.query as any;
    const where: any = { deletedAt: null };
    if (workspaceId) where.workspaceId = workspaceId;
    if (status) where.status = status;
    
    const [forms, total] = await Promise.all([
      prisma.form.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { theme: { select: { id: true, name: true } } },
      }),
      prisma.form.count({ where }),
    ]);
    
    return { forms, total, page, limit, totalPages: Math.ceil(total / limit) };
  });
  
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const form = await prisma.form.findUnique({
      where: { id },
      include: { theme: true, workspace: true, integrations: true, webhooks: true },
    });
    
    if (!form || form.deletedAt) {
      return reply.status(404).send({ error: 'Not Found', message: 'Form not found' });
    }
    return form;
  });
  
  fastify.post('/', async (request, reply) => {
    const data = createFormSchema.parse(request.body);
    const form = await prisma.form.create({
      data: {
        ...data,
        definition: { id: crypto.randomUUID(), version: 1, name: data.name, pages: [], logic: [], integrations: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      },
    });
    return reply.status(201).send(form);
  });
  
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as any;
    const form = await prisma.form.findUnique({ where: { id } });
    if (!form || form.deletedAt) {
      return reply.status(404).send({ error: 'Not Found', message: 'Form not found' });
    }
    return prisma.form.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  });
  
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.form.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  });
}