/**
 * Payment routes - Stripe and PayPal checkout
 */
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@domeforms/database';
import { createCheckoutSession, getStripeClient } from '../services/payment.js';
import { createPayPalOrder, handlePayPalWebhook, capturePayPalPayment } from '../services/paypal.js';

const createPaymentSchema = z.object({
  formId: z.string().uuid(),
  submissionId: z.string().uuid(),
  provider: z.enum(['stripe', 'paypal']),
  amount: z.number().min(0),
  currency: z.string().default('usd'),
  description: z.string().optional(),
});

export async function paymentsRoutes(fastify: FastifyInstance) {
  // Create payment checkout session (Stripe or PayPal)
  fastify.post('/checkout', async (request, reply) => {
    const data = createPaymentSchema.parse(request.body);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${frontendUrl}/payment/success?submission=${data.submissionId}`;
    const cancelUrl = `${frontendUrl}/payment/cancel?submission=${data.submissionId}`;

    if (data.provider === 'paypal') {
      const result = await createPayPalOrder(
        data.submissionId,
        data.amount,
        data.currency,
        data.description || 'Form Payment',
        successUrl,
        cancelUrl
      );
      return { orderId: result.orderId, approvalUrl: result.approvalUrl };
    }
    
    // Default to Stripe
    const result = await createCheckoutSession(
      data.submissionId,
      { amount: data.amount, currency: data.currency, description: data.description },
      successUrl,
      cancelUrl
    );
    return { sessionId: result.sessionId, url: result.url };
  });

  // Capture PayPal payment manually (for direct API use)
  fastify.post('/paypal/:orderId/capture', async (request, reply) => {
    const { orderId } = request.params as { orderId: string };
    const result = await capturePayPalPayment(orderId);
    return { ...result, capturedAt: new Date() };
  });

  // Get payment button config for embedding
  fastify.get('/button-config', async (request, reply) => {
    return { providers: ['stripe', 'paypal'] };
  });
}
