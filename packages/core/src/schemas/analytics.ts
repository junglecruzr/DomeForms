/**
 * Analytics schemas
 */

import { z } from 'zod';
import { uuidSchema } from './base.js';

export const numericStatsSchema = z.object({
  min: z.number(),
  max: z.number(),
  mean: z.number(),
  median: z.number(),
  sum: z.number(),
  stdDev: z.number(),
});

export const fieldAnalyticsSchema = z.object({
  fieldId: uuidSchema,
  fieldName: z.string(),
  fieldType: z.string(),
  totalResponses: z.number().int().min(0),
  uniqueResponses: z.number().int().min(0),
  skipRate: z.number().min(0).max(1),
  errorRate: z.number().min(0).max(1),
  distribution: z.record(z.number()).optional(),
  numericStats: numericStatsSchema.optional(),
});

export const stepAnalyticsSchema = z.object({
  stepIndex: z.number().int().min(0),
  stepName: z.string(),
  views: z.number().int().min(0),
  completions: z.number().int().min(0),
  dropOffs: z.number().int().min(0),
  dropOffRate: z.number().min(0).max(1),
  averageDuration: z.number().min(0),
});

export const deviceBreakdownSchema = z.object({
  desktop: z.number().int().min(0),
  mobile: z.number().int().min(0),
  tablet: z.number().int().min(0),
});

export const browserBreakdownSchema = z.object({
  chrome: z.number().int().min(0),
  firefox: z.number().int().min(0),
  safari: z.number().int().min(0),
  edge: z.number().int().min(0),
  other: z.number().int().min(0),
});

export const sourceBreakdownSchema = z.object({
  direct: z.number().int().min(0),
  organic: z.number().int().min(0),
  referral: z.number().int().min(0),
  social: z.number().int().min(0),
  email: z.number().int().min(0),
  paid: z.number().int().min(0),
  other: z.number().int().min(0),
});

export const formAnalyticsSchema = z.object({
  formId: uuidSchema,
  period: z.enum(['hour', 'day', 'week', 'month', 'year', 'all']),
  views: z.number().int().min(0),
  starts: z.number().int().min(0),
  submissions: z.number().int().min(0),
  completionRate: z.number().min(0).max(1),
  averageDuration: z.number().min(0),
  fieldAnalytics: z.array(fieldAnalyticsSchema),
  stepAnalytics: z.array(stepAnalyticsSchema).optional(),
  deviceBreakdown: deviceBreakdownSchema,
  browserBreakdown: browserBreakdownSchema,
  sourceBreakdown: sourceBreakdownSchema,
});