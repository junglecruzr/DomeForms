/**
 * Integration schema
 */

import { z } from 'zod';
import { uuidSchema } from './base.js';

export const fieldMappingSchema = z.object({
  formFieldId: uuidSchema,
  integrationField: z.string(),
  transform: z.enum(['none', 'uppercase', 'lowercase', 'trim', 'json']).default('none'),
});

export const integrationConfigSchema = z.object({
  id: uuidSchema,
  type: z.enum([
    'email', 'webhook', 'zapier', 'mailchimp', 'hubspot',
    'salesforce', 'activecampaign', 'convertkit', 'stripe',
    'paypal', 'twilio', 'custom',
  ]),
  name: z.string(),
  enabled: z.boolean().default(true),
  config: z.record(z.unknown()).default({}),
  fieldMapping: z.array(fieldMappingSchema).default([]),
  conditionalLogic: z.array(z.any()).default([]),
  runOn: z.enum(['submit', 'payment_success', 'payment_failed', 'step_complete']).default('submit'),
});