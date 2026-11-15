/**
 * PayPal Payment Service
 * Handles order creation, capture, and webhook processing for PayPal payments
 */

import { env } from '../config/env.js';
import { prisma } from '@domeforms/database';
import type { SubmissionStatus, PaymentStatus } from '@domeforms/database';

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrderCreate {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

const PAYPAL_API_BASE = (mode?: string) => 
  mode === 'live' ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com';

/**
 * Get OAuth2 access token from PayPal
 */
async function getPayPalAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_BASE()}/v1/auth/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal token request failed: ${error}`);
  }

  const data = await response.json() as PayPalTokenResponse;
  return data.access_token;
}

/**
 * Create a PayPal order for payment
 */
export async function createPayPalOrder(
  submissionId: string,
  amount: number,
  currency: string,
  description: string = 'Form Payment',
  successUrl: string,
  cancelUrl: string
): Promise<{ orderId: string; approvalUrl: string }> {
  const clientId = env.PAYPAL_CLIENT_ID;
  const clientSecret = env.PAYPAL_SECRET_KEY;
  const mode = env.PAYPAL_MODE || 'sandbox';

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_SECRET_KEY are required for PayPal payments');
  }

  const accessToken = await getPayPalAccessToken(clientId, clientSecret);

  const orderBody = {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: submissionId,
      amount: {
        currency_code: currency.toUpperCase(),
        value: (amount / 100).toFixed(2),
      },
      description: description,
    }],
    application_context: {
      return_url: successUrl,
      cancel_url: cancelUrl,
      shipping_preference: 'NO_SHIPPING',
    },
  };

  const response = await fetch(`${PAYPAL_API_BASE(mode)}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'PayPal-Request-Id': `${submissionId}-${Date.now()}`,
    },
    body: JSON.stringify(orderBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal order creation failed: ${error}`);
  }

  const order = await response.json() as PayPalOrderCreate;
  const approveLink = order.links.find(link => link.rel === 'approve');
  
  if (!approveLink) {
    throw new Error('PayPal order missing approval link');
  }

  return { orderId: order.id, approvalUrl: approveLink.href };
}

/**
 * Capture payment from approved PayPal order
 */
export async function capturePayPalPayment(orderId: string): Promise<{
  paymentId: string;
  amount: number;
  currency: string;
}> {
  const clientId = env.PAYPAL_CLIENT_ID;
  const clientSecret = env.PAYPAL_SECRET_KEY;

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_SECRET_KEY are required');
  }

  const accessToken = await getPayPalAccessToken(clientId, clientSecret);
  const mode = env.PAYPAL_MODE || 'sandbox';

  const response = await fetch(`${PAYPAL_API_BASE(mode)}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal capture failed: ${error}`);
  }

  const result = await response.json() as any;
  const unit = result.purchase_units?.[0];

  return {
    paymentId: result.id,
    amount: parseFloat(unit?.amount?.value || '0') * 100,
    currency: unit?.amount?.currency_code || 'USD',
  };
}

/**
 * Handle PayPal IPN/Webhook notifications
 */
export async function handlePayPalWebhook(payload: any): Promise<void> {
  if (payload.event_type && payload.resource) {
    switch (payload.event_type) {
      case 'CHECKOUT.ORDER.COMPLETED':
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const orderId = payload.resource.id;
        const submissionId = payload.resource.purchase_units?.[0]?.reference_id;
        
        if (submissionId) {
          await prisma.submission.update({
            where: { id: submissionId },
            data: {
              status: 'COMPLETED' as SubmissionStatus,
              paymentStatus: 'PAID' as PaymentStatus,
              paymentId: `paypal_${orderId}`,
              completedAt: new Date(),
            },
          });

          await prisma.submissionEvent.create({
            data: {
              submissionId,
              type: 'payment_success',
              data: { paypalOrderId: orderId },
            },
          });
        }
        break;
      }

      case 'CHECKOUT.ORDER.DENIED':
      case 'CHECKOUT.ORDER.CANCELLED': {
        const submissionId = payload.resource.purchase_units?.[0]?.reference_id;
        if (submissionId) {
          await prisma.submission.update({
            where: { id: submissionId },
            data: { paymentStatus: 'FAILED' as PaymentStatus },
          });
        }
        break;
      }
    }
  }
}
