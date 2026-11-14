/**
 * Layout schemas
 */

import { z } from 'zod';
import { uuidSchema, cssColorSchema, cssSizeSchema } from './base.js';

export const responsiveWidthsSchema = z.object({
  xs: z.number().int().min(1).max(12).optional(),
  sm: z.number().int().min(1).max(12).optional(),
  md: z.number().int().min(1).max(12).optional(),
  lg: z.number().int().min(1).max(12).optional(),
  xl: z.number().int().min(1).max(12).optional(),
  '2xl': z.number().int().min(1).max(12).optional(),
});

export const rowSettingsSchema = z.object({
  gap: cssSizeSchema.optional(),
  align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
  justify: z.enum(['start', 'center', 'end', 'between', 'around']).optional(),
  padding: cssSizeSchema.optional(),
  backgroundColor: cssColorSchema.optional(),
  borderRadius: cssSizeSchema.optional(),
  border: z.string().optional(),
});

// Forward declarations
export const fieldInstanceSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: uuidSchema,
    type: z.enum([
      'text', 'textarea', 'email', 'password', 'number', 'tel', 'url', 'search', 'hidden',
      'select', 'multiselect', 'radio', 'checkbox', 'checkbox-group', 'toggle', 'rating',
      'date', 'time', 'datetime', 'daterange',
      'file', 'image', 'signature',
      'calculation', 'html', 'divider', 'section', 'page-break', 'button',
      'recaptcha', 'turnstile',
    ]),
    label: z.string(),
    name: z.string(),
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
    defaultValue: z.unknown().optional(),
    required: z.boolean().default(false),
    disabled: z.boolean().default(false),
    hidden: z.boolean().default(false),
    readonly: z.boolean().default(false),
    validation: z.array(z.any()).default([]),
    conditionalLogic: z.array(z.any()).default([]),
    calculation: z.any().optional(),
    options: z.array(z.any()).optional(),
    settings: z.record(z.unknown()).default({}),
    layout: z.any(),
  })
);

export const rowSchema = z.object({
  id: uuidSchema,
  fields: z.array(fieldInstanceSchema),
  settings: rowSettingsSchema.optional(),
});

export const columnSchema = z.object({
  id: uuidSchema,
  width: z.number().int().min(1).max(12),
  offset: z.number().int().min(0).max(11).optional(),
  rows: z.array(rowSchema),
  responsive: responsiveWidthsSchema.optional(),
});

export const formPageSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  description: z.string().optional(),
  columns: z.array(columnSchema),
  logic: z.array(z.any()).optional(),
});