/**
 * Payment service for processing form payments via Stripe
 */
import Stripe from 'stripe';
export declare function getStripeClient(): Stripe;
export interface PaymentConfig {
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, string>;
}
export declare function createCheckoutSession(submissionId: string, config: PaymentConfig, successUrl: string, cancelUrl: string): Promise<{
    sessionId: string;
    url: string;
}>;
export declare function handleStripeWebhook(payload: Buffer, sig: string): Promise<void>;
//# sourceMappingURL=payment.d.ts.map