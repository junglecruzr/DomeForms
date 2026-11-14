/**
 * Form definition schema
 */

import { z } from 'zod';
import { uuidSchema, isoDateSchema } from './base.js';
import { formSettingsSchema } from './form-settings.js';
import { formPageSchema } from './layout.js';
import { conditionalLogicRuleSchema } from './logic.js';
import { integrationConfigSchema } from './integration.js';

export const formDefinitionSchema = z.object({
  id: uuidSchema,
  version: z.number().int().min(1).default(1),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  settings: formSettingsSchema,
  themeId: uuidSchema.optional(),
  pages: z.array(formPageSchema).min(1),
  logic: z.array(conditionalLogicRuleSchema).default([]),
  integrations: z.array(integrationConfigSchema).default([]),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  publishedAt: isoDateSchema.optional(),
});