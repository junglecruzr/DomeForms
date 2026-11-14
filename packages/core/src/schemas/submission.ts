/**
 * Submission schemas
 */

import { z } from 'zod';
import { uuidSchema, isoDateSchema } from './base.js';

export const utmTagsSchema = z.object({
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  term: z.string().optional(),
  content: z.string().optional(),
});

export const submissionMetadataSchema = z.object({
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  utm: utmTagsSchema.optional(),
  duration: z.number().int().min(0).optional(),
  pageViews: z.number().int().min(0).optional(),
  incomplete: z.boolean().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

export const submissionSchema = z.object({
  id: uuidSchema,
  formId: uuidSchema,
  formVersion: z.number().int().min(1),
  data: z.record(z.unknown()),
  metadata: submissionMetadataSchema,
  status: z.enum(['pending', 'completed', 'failed', 'spam', 'archived']),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded', 'partial']).optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  completedAt: isoDateSchema.optional(),
});