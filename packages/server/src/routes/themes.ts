/**
 * Themes routes
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@domeforms/database';

const createThemeSchema = z.object({
  name: z.string().min(1).max(100),
  workspaceId: z.string().uuid(),
  variables: z.record(z.string()),
  customCss: z.string().optional(),
});

export async function themesRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const { workspaceId } = request.query as { workspaceId?: string };
    const where = workspaceId ? { workspaceId } : {};
    return prisma.theme.findMany({ where, orderBy: { updatedAt: 'desc' } });
  });
  
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const theme = await prisma.theme.findUnique({ where: { id } });
    if (!theme) return reply.status(404).send({ error: 'Not Found', message: 'Theme not found' });
    return theme;
  });
  
  fastify.post('/', async (request, reply) => {
    const data = createThemeSchema.parse(request.body);
    return prisma.theme.create({ data });
  });
  
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as any;
    return prisma.theme.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  });
  
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.theme.delete({ where: { id } });
    return { success: true };
  });
}