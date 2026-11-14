/**
 * Calculation schema
 */

import { z } from 'zod';
import { uuidSchema } from './base.js';

export const calculationConfigSchema = z.object({
  formula: z.string(),
  fields: z.array(uuidSchema),
  decimals: z.number().int().min(0).max(10).optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  format: z.enum(['number', 'currency', 'percent']).optional(),
  locale: z.string().optional(),
});