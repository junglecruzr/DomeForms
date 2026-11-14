/**
 * Calculation types
 */

import type { UUID } from './base.js';

export interface CalculationConfig {
  formula: string;
  fields: UUID[];
  decimals?: number;
  prefix?: string;
  suffix?: string;
  format?: 'number' | 'currency' | 'percent';
  locale?: string;
}