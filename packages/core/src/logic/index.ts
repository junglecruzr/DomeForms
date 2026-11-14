/**
 * Conditional logic engine
 */

import type { ConditionalLogicRule, LogicCondition, LogicActionConfig } from '../types/logic.js';
import type { UUID } from '../types/base.js';
import type { FieldValue } from '../types/field.js';

export interface LogicContext {
  values: Record<string, FieldValue>;
  fields: Map<string, { id: UUID; type: string }>;
}

export function evaluateCondition(condition: LogicCondition, context: LogicContext): boolean {
  const fieldValue = context.values[condition.fieldId];
  
  // Handle compound conditions
  if (condition.conditions && condition.conditions.length > 0) {
    const combinator = condition.combinator ?? 'AND';
    const results = condition.conditions.map(c => evaluateCondition(c, context));
    return combinator === 'AND' ? results.every(r => r) : results.some(r => r);
  }
  
  // Handle operators
  const expectedValue = condition.value;
  
  switch (condition.operator) {
    case 'equals':
      return looseEqual(fieldValue, expectedValue);
    case 'notEquals':
      return !looseEqual(fieldValue, expectedValue);
    case 'contains':
      return Array.isArray(fieldValue) 
        ? (fieldValue as any[]).includes(expectedValue)
        : String(fieldValue ?? '').includes(String(expectedValue ?? ''));
    case 'notContains':
      return Array.isArray(fieldValue)
        ? !(fieldValue as any[]).includes(expectedValue)
        : !String(fieldValue ?? '').includes(String(expectedValue ?? ''));
    case 'startsWith':
      return String(fieldValue ?? '').startsWith(String(expectedValue ?? ''));
    case 'endsWith':
      return String(fieldValue ?? '').endsWith(String(expectedValue ?? ''));
    case 'greaterThan':
      return Number(fieldValue) > Number(expectedValue);
    case 'lessThan':
      return Number(fieldValue) < Number(expectedValue);
    case 'greaterThanOrEqual':
      return Number(fieldValue) >= Number(expectedValue);
    case 'lessThanOrEqual':
      return Number(fieldValue) <= Number(expectedValue);
    case 'isEmpty':
      return fieldValue === null || fieldValue === undefined || 
        (typeof fieldValue === 'string' && fieldValue.trim() === '') ||
        (Array.isArray(fieldValue) && fieldValue.length === 0);
    case 'isNotEmpty':
      return !(fieldValue === null || fieldValue === undefined || 
        (typeof fieldValue === 'string' && fieldValue.trim() === '') ||
        (Array.isArray(fieldValue) && fieldValue.length === 0));
    case 'matches':
      try {
        return new RegExp(String(expectedValue)).test(String(fieldValue ?? ''));
      } catch {
        return false;
      }
    case 'notMatches':
      try {
        return !new RegExp(String(expectedValue)).test(String(fieldValue ?? ''));
      } catch {
        return true;
      }
    default:
      return false;
  }
}

function looseEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => looseEqual(val, b[i]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => looseEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
  }
  return String(a) === String(b);
}

export function evaluateRule(rule: ConditionalLogicRule, context: LogicContext): boolean {
  if (!rule.enabled) return false;
  return rule.conditions.every(condition => evaluateCondition(condition, context));
}

export function getActionsForContext(rules: ConditionalLogicRule[], context: LogicContext): LogicActionConfig[] {
  const actions: LogicActionConfig[] = [];
  
  for (const rule of rules) {
    if (evaluateRule(rule, context)) {
      actions.push(...rule.actions);
    }
  }
  
  return actions;
}

export function applyActions(
  actions: LogicActionConfig[],
  currentValues: Record<string, FieldValue>,
  _fields: Map<string, { id: UUID; type: string }>
): Record<string, FieldValue> {
  const newValues = { ...currentValues };
  
  for (const action of actions) {
    switch (action.type) {
      case 'show':
      case 'hide':
      case 'require':
      case 'unrequire':
      case 'enable':
      case 'disable':
        // These are UI-level actions, handled by the renderer
        break;
      case 'setValue':
        newValues[action.targetFieldId] = action.value as FieldValue;
        break;
      case 'clearValue':
        newValues[action.targetFieldId] = null;
        break;
      case 'setOptions':
        // UI-level action
        break;
      case 'calculate':
        // Handled by math engine
        break;
    }
  }
  
  return newValues;
}