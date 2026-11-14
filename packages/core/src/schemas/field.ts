/**
 * Field schemas
 */

import { z } from 'zod';

export const fieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  disabled: z.boolean().optional(),
  selected: z.boolean().optional(),
  showIf: z.array(z.any()).optional(),
});

export const fieldLayoutSchema = z.object({
  labelPosition: z.enum(['top', 'left', 'right', 'floating', 'none']).default('top'),
  labelWidth: z.number().int().min(1).max(11).optional(),
  fullWidth: z.boolean().default(true),
  wrapperClass: z.string().optional(),
  labelClass: z.string().optional(),
  inputClass: z.string().optional(),
  errorClass: z.string().optional(),
});