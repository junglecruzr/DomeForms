import { describe, it, expect } from 'vitest';
import { evaluateRule, applyActions } from '../logic/index.js';
import { uuid } from '../types/base.js';

describe('Logic Engine', () => {
  const field1Id = uuid();
  const field2Id = uuid();
  const field3Id = uuid();
  const field4Id = uuid();

  const context = {
    values: {
      [field1Id]: 'yes',
      [field2Id]: 10,
      [field3Id]: ['a', 'b'],
    },
    fields: new Map([
      [field1Id, { id: field1Id, type: 'radio' }],
      [field2Id, { id: field2Id, type: 'number' }],
      [field3Id, { id: field3Id, type: 'checkbox-group' }],
    ]),
  };

  it('evaluates equals condition', () => {
    const condition = { fieldId: field1Id, operator: 'equals' as const, value: 'yes' };
    expect(evaluateRule({
      id: uuid(),
      enabled: true,
      conditions: [condition],
      actions: [],
    }, context)).toBe(true);
  });

  it('evaluates notEquals condition', () => {
    const condition = { fieldId: field1Id, operator: 'notEquals' as const, value: 'no' };
    expect(evaluateRule({
      id: uuid(),
      enabled: true,
      conditions: [condition],
      actions: [],
    }, context)).toBe(true);
  });

  it('evaluates contains condition', () => {
    const condition = { fieldId: field3Id, operator: 'contains' as const, value: 'a' };
    expect(evaluateRule({
      id: uuid(),
      enabled: true,
      conditions: [condition],
      actions: [],
    }, context)).toBe(true);
  });

  it('evaluates greaterThan condition', () => {
    const condition = { fieldId: field2Id, operator: 'greaterThan' as const, value: 5 };
    expect(evaluateRule({
      id: uuid(),
      enabled: true,
      conditions: [condition],
      actions: [],
    }, context)).toBe(true);
  });

  it('evaluates isEmpty condition', () => {
    const emptyContext = { ...context, values: { ...context.values, [field4Id]: '' } };
    const condition = { fieldId: field4Id, operator: 'isEmpty' as const };
    expect(evaluateRule({
      id: uuid(),
      enabled: true,
      conditions: [condition],
      actions: [],
    }, emptyContext)).toBe(true);
  });

  it('applies setValue action', () => {
    const actions = [{ type: 'setValue' as const, targetFieldId: field4Id, value: 'new value' }];
    const result = applyActions(actions, context.values, context.fields);
    expect(result[field4Id]).toBe('new value');
  });

  it('applies clearValue action', () => {
    const actions = [{ type: 'clearValue' as const, targetFieldId: field1Id }];
    const result = applyActions(actions, context.values, context.fields);
    expect(result[field1Id]).toBe(null);
  });
});