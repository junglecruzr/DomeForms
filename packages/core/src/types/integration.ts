/**
 * Integration types
 */

import type { UUID } from './base.js';

export type IntegrationType =
  | 'email'
  | 'webhook'
  | 'zapier'
  | 'mailchimp'
  | 'hubspot'
  | 'salesforce'
  | 'activecampaign'
  | 'convertkit'
  | 'stripe'
  | 'paypal'
  | 'twilio'
  | 'custom';

export interface IntegrationConfig {
  id: UUID;
  type: IntegrationType;
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
  fieldMapping: FieldMapping[];
  conditionalLogic: ConditionalLogicRule[];
  runOn: 'submit' | 'payment_success' | 'payment_failed' | 'step_complete';
}

export interface FieldMapping {
  formFieldId: UUID;
  integrationField: string;
  transform?: 'none' | 'uppercase' | 'lowercase' | 'trim' | 'json';
}

export interface ConditionalLogicRule {}