/**
 * Payment service for processing form payments via Stripe
 */

import Stripe from 'stripe';
import { env } from '../config/env.js';
import { prisma } from '@domeforms/database';
import type { SubmissionStatus, PaymentStatus } from '@domeforms/database';

let stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripe) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required for payment processing');
    }
    stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-10-28.endive' as any,
      typescript: true,
    });
  }
  return stripe;
}

export interface PaymentConfig {
  amount: number; // in cents
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession(
  submissionId: string,
  config: PaymentConfig,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripeClient();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (stripe.checkout.sessions.create as any)({
    payment_method_types: ['card'],
    customer_email: config.metadata?.email,
    line_items: [
      {
        price_data: {
          currency: config.currency,
          product_data: {
            name: config.description || 'Form Payment',
          },
          unit_amount: config.amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      ...config.metadata,
      submissionId,
    },
  });

  return {
    sessionId: session.id,
    url: session.url || '',
  };
}

export async function handleStripeWebhook(payload: Buffer, sig: string): Promise<void> {
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required for webhook verification');
  }

  const stripe = getStripeClient();
  const event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const submissionId = session.metadata?.submissionId;
      
      if (submissionId) {
        const paymentIntentId = typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : (session.payment_intent as any)?.id;

        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: 'COMPLETED' as SubmissionStatus,
            paymentStatus: 'PAID' as PaymentStatus,
            paymentId: String(paymentIntentId || ''),
            paymentAmount: session.amount_total || 0,
            completedAt: new Date(),
          },
        });

        // Log the payment event
        await prisma.submissionEvent.create({
          data: {
            submissionId,
            type: 'payment_success',
            data: {
              paymentIntentId: String(paymentIntentId || ''),
              amount: session.amount_total || 0,
              currency: session.currency || 'usd',
            },
          },
        });
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const submissionId = session.metadata?.submissionId;
      
      if (submissionId) {
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: 'FAILED' as SubmissionStatus,
            paymentStatus: 'FAILED' as PaymentStatus,
          },
        });
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
}

