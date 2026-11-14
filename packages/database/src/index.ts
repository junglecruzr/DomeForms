/**
 * DomeForms Database Client
 * Re-exports Prisma client with extensions and Prisma namespace types
 */

import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';

// Type declaration for Node.js process global
declare const process: {
  env: {
    NODE_ENV: string;
    [key: string]: string | undefined;
  }
};


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Extensions can be added here
export const extendedPrisma = prisma.$extends({
  name: 'domeforms',
  model: {
    form: {
      async findPublishedById(id: string) {
        return prisma.form.findFirst({
          where: { id, status: 'PUBLISHED', deletedAt: null },
        });
      },
    },
    submission: {
      async countByForm(formId: string) {
        return prisma.submission.count({
          where: { formId, status: 'COMPLETED' },
        });
      },
    },
  },
});

export type PrismaClientExtended = typeof extendedPrisma;

// Re-export Prisma namespace
export { Prisma } from '@prisma/client';

// Export commonly used Prisma types (these are not duplicated from Prisma namespace)
export type PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;

// Export enums as const objects (for use as values)
export const FormStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export const SubmissionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  SPAM: 'SPAM',
  ARCHIVED: 'ARCHIVED',
} as const;

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIAL: 'PARTIAL',
} as const;

export const IntegrationType = {
  EMAIL: 'EMAIL',
  WEBHOOK: 'WEBHOOK',
  ZAPIER: 'ZAPIER',
  MAILCHIMP: 'MAILCHIMP',
  HUBSPOT: 'HUBSPOT',
  SALESFORCE: 'SALESFORCE',
  ACTIVECAMPAIGN: 'ACTIVECAMPAIGN',
  CONVERTKIT: 'CONVERTKIT',
  STRIPE: 'STRIPE',
  PAYPAL: 'PAYPAL',
  TWILIO: 'TWILIO',
  CUSTOM: 'CUSTOM',
} as const;

export const LogStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  RETRYING: 'RETRYING',
} as const;

export const DeliveryStatus = {
  PENDING: 'PENDING',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  RETRYING: 'RETRYING',
} as const;

export const AnalyticsPeriod = {
  HOUR: 'HOUR',
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  YEAR: 'YEAR',
} as const;

export const Role = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;

export const Plan = {
  FREE: 'FREE',
  PRO: 'PRO',
  TEAM: 'TEAM',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export const BillingStatus = {
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  CANCELED: 'CANCELED',
  TRIALING: 'TRIALING',
  INCOMPLETE: 'INCOMPLETE',
} as const;

// Type aliases for enum keys (for use as types)
export type FormStatus = keyof typeof FormStatus;
export type SubmissionStatus = keyof typeof SubmissionStatus;
export type PaymentStatus = keyof typeof PaymentStatus;
export type IntegrationType = keyof typeof IntegrationType;
export type LogStatus = keyof typeof LogStatus;
export type DeliveryStatus = keyof typeof DeliveryStatus;
export type AnalyticsPeriod = keyof typeof AnalyticsPeriod;
export type Role = keyof typeof Role;
export type Plan = keyof typeof Plan;
export type BillingStatus = keyof typeof BillingStatus;