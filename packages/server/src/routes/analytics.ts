/**
 * Analytics routes
 */

import { FastifyInstance } from 'fastify';
import { prisma } from '@domeforms/database';

export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.get('/forms/:formId', async (request, reply) => {
    const { formId } = request.params as { formId: string };
    const { period = 'day', days = 30 } = request.query as { period?: string; days?: number };
    
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const analytics = await prisma.formAnalytics.findMany({
      where: { formId, date: { gte: since }, period: period as any },
      orderBy: { date: 'asc' },
    });
    
    // Aggregate totals
    const totals = analytics.reduce((acc, a) => ({
      views: acc.views + a.views,
      starts: acc.starts + a.starts,
      submissions: acc.submissions + a.submissions,
    }), { views: 0, starts: 0, submissions: 0 });
    
    const completionRate = totals.starts > 0 ? totals.submissions / totals.starts : 0;
    
    return { analytics, totals, completionRate };
  });
  
  fastify.get('/forms/:formId/fields', async (request, reply) => {
    const { formId } = request.params as { formId: string };
    const { period = 'day', days = 30 } = request.query as { period?: string; days?: number };
    
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    return prisma.fieldAnalytics.findMany({
      where: { formId, date: { gte: since }, period: period as any },
      orderBy: { date: 'asc' },
    });
  });
  
  fastify.get('/forms/:formId/realtime', async (request, reply) => {
    const { formId } = request.params as { formId: string };
    
    const [today, thisWeek, thisMonth] = await Promise.all([
      prisma.formAnalytics.aggregate({
        where: { formId, date: { gte: new Date(new Date().setHours(0,0,0,0)) } },
        _sum: { views: true, starts: true, submissions: true },
      }),
      prisma.formAnalytics.aggregate({
        where: { formId, date: { gte: new Date(Date.now() - 7*24*60*60*1000) } },
        _sum: { views: true, starts: true, submissions: true },
      }),
      prisma.formAnalytics.aggregate({
        where: { formId, date: { gte: new Date(Date.now() - 30*24*60*60*1000) } },
        _sum: { views: true, starts: true, submissions: true },
      }),
    ]);
    
    return { today: today._sum, thisWeek: thisWeek._sum, thisMonth: thisMonth._sum };
  });
}