/**
 * Logic schemas
 */

import { z } from 'zod';
import { uuidSchema } from './base.js';

export const logicConditionSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    fieldId: uuidSchema,
    operator: z.enum([
      'equals', 'notEquals', 'contains', 'notContains',
      'startsWith', 'endsWith', 'greaterThan', 'lessThan',
      'greaterThanOrEqual', 'lessThanOrEqual', 'isEmpty',
      'isNotEmpty', 'matches', 'notMatches',
    ]),
    value: z.unknown().optional(),
    conditions: z.array(logicConditionSchema).optional(),
    combinator: z.enum(['AND', 'OR']).optional(),
  })
);

export const logicActionConfigSchema = z.object({
  type: z.enum([
    'show', 'hide', 'require', 'unrequire', 'enable', 'disable',
    'setValue', 'clearValue', 'setOptions', 'calculate',
  ]),
  targetFieldId: uuidSchema,
  value: z.unknown().optional(),
  options: z.array(z.any()).optional(),
  formula: z.string().optional(),
});

export const conditionalLogicRuleSchema = z.object({
  id: uuidSchema,
  name: z.string().optional(),
  enabled: z.boolean().default(true),
  conditions: z.array(logicConditionSchema),
  actions: z.array(logicActionConfigSchema),
});