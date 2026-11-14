/**
 * Conditional logic types
 */

import type { UUID } from './base.js';
import type { FieldOption } from './field.js';

export type LogicOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'matches'
  | 'notMatches';

export type LogicAction =
  | 'show'
  | 'hide'
  | 'require'
  | 'unrequire'
  | 'enable'
  | 'disable'
  | 'setValue'
  | 'clearValue'
  | 'setOptions'
  | 'calculate';

export interface LogicCondition {
  fieldId: UUID;
  operator: LogicOperator;
  value?: unknown;
  conditions?: LogicCondition[];
  combinator?: 'AND' | 'OR';
}

export interface LogicActionConfig {
  type: LogicAction;
  targetFieldId: UUID;
  value?: unknown;
  options?: FieldOption[];
  formula?: string;
}

export interface ConditionalLogicRule {
  id: UUID;
  name?: string;
  enabled: boolean;
  conditions: LogicCondition[];
  actions: LogicActionConfig[];
}