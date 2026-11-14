/**
 * Submissions routes
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@domeforms/database';
import { SubmissionStatus, PaymentStatus } from '@domeforms/database';
import { createCheckoutSession, handleStripeWebhook } from '../services/payment.js';
import { env } from '../config/env.js';

const updateSubmissionSchema = z.object({
  status: z.nativeEnum(SubmissionStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
});

export async function submissionsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const { formId, status, page = 1, limit = 50 } = request.query as any;
    const where: any = {};
    if (formId) where.formId = formId;
    if (status) where.status = status;
    
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { fieldValues: true },
      }),
      prisma.submission.count({ where }),
    ]);
    
    return { submissions, total, page, limit, totalPages: Math.ceil(total / limit) };
  });
  
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { fieldValues: true, files: true, events: true },
    });
    if (!submission) {
      return reply.status(404).send({ error: 'Not Found', message: 'Submission not found' });
    }
    return submission;
  });
  
  // Public submission endpoint (no auth)
  fastify.post('/public', async (request, reply) => {
    const { formId, data, metadata, captchaToken } = request.body as any;
    const form = await prisma.form.findUnique({ where: { id: formId } });
    
    if (!form || form.status !== 'PUBLISHED') {
      return reply.status(404).send({ error: 'Not Found', message: 'Form not found or not published' });
    }

    // Security checks
    const def = form.definition as any;
    const settings = def.settings || {};

    // Honeypot check
    if (settings.honeypotEnabled) {
      const hpField = settings.honeypotFieldName || 'honeypot';
      if (data[hpField]) {
        return reply.status(400).send({ error: 'Spam detected' });
      }
    }

    // CAPTCHA/Turnstile verification
    if (settings.recaptchaEnabled || settings.turnstileEnabled) {
      if (!captchaToken) {
        return reply.status(400).send({ error: 'CAPTCHA token required' });
      }
      // Implementation note: Call remote validation API here
    }

    // Check for payment integrations
    const paymentIntegrations = def.integrations?.filter(
      (integration: any) => integration.type === 'stripe' && integration.enabled
    ) || [];
    
    if (paymentIntegrations.length > 0) {
      // Extract payment configuration from integration
      const stripeConfig = paymentIntegrations[0].config || {};
      const amount = parseInt(stripeConfig.amount || '0');
      const currency = stripeConfig.currency || 'usd';
      const description = stripeConfig.description || 'Form Payment';
      
      // Create pending submission first
      const submission = await prisma.submission.create({
        data: {
          formId,
          formVersion: form.version,
          data,
          metadata: metadata || {},
          status: 'PENDING' as SubmissionStatus,
          paymentStatus: 'PENDING' as PaymentStatus,
        },
      });

      // Generate payment URLs
      const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
      const successUrl = `${frontendUrl}/success?submission=${submission.id}`;
      const cancelUrl = `${frontendUrl}/cancel`;

      try {
        const { url } = await createCheckoutSession(submission.id, {
          amount,
          currency,
          description,
          metadata: {
            email: data.email,
            formName: form.name,
          },
        }, successUrl, cancelUrl);

        return {
          success: true,
          submissionId: submission.id,
          checkoutUrl: url,
          requiresPayment: true,
        };
      } catch (error: any) {
        return reply.status(500).send({ 
          error: 'Payment setup failed', 
          message: error.message 
        });
      }
    }

    // If no payment integration, process normally
    const submission = await prisma.submission.create({
      data: {
        formId,
        formVersion: form.version,
        data,
        metadata: metadata || {},
        status: 'COMPLETED' as SubmissionStatus,
        completedAt: new Date(),
      },
    });

    return { success: true, submissionId: submission.id };
  });
  
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = updateSubmissionSchema.parse(request.body);
    return prisma.submission.update({ where: { id }, data });
  });
  
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.submission.delete({ where: { id } });
    return { success: true };
  });
}