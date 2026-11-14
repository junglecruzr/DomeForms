import { describe, it, expect } from 'vitest';
import { tokenize, parse, evaluate, formatResult } from '../math/index.js';

describe('Math Engine', () => {
  it('tokenizes simple expressions', () => {
    const tokens = tokenize('1 + 2');
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({ type: 'number', value: 1 });
    expect(tokens[1]).toEqual({ type: 'operator', value: '+' });
    expect(tokens[2]).toEqual({ type: 'number', value: 2 });
  });

  it('tokenizes identifiers', () => {
    const tokens = tokenize('field1 + field2');
    expect(tokens[0]).toEqual({ type: 'identifier', name: 'field1' });
    expect(tokens[2]).toEqual({ type: 'identifier', name: 'field2' });
  });

  it('tokenizes functions', () => {
    const tokens = tokenize('max(a, b)');
    expect(tokens[0]).toEqual({ type: 'function', name: 'max' });
    expect(tokens[1]).toEqual({ type: 'paren', value: '(' });
  });

  it('parses and evaluates expressions', () => {
    const tokens = tokenize('10 + 5 * 2');
    const parsed = parse(tokens, []);
    const result = evaluate(parsed, {});
    expect(result).toBe(20);
  });

  it('evaluates with variables', () => {
    const tokens = tokenize('field1 + field2 * 2');
    const parsed = parse(tokens, ['field1', 'field2']);
    const result = evaluate(parsed, { field1: 10, field2: 5 });
    expect(result).toBe(20);
  });

  it('evaluates functions', () => {
    const tokens = tokenize('max(5, 10)');
    const parsed = parse(tokens, []);
    const result = evaluate(parsed, {});
    expect(result).toBe(10);
  });

  it('evaluates if function', () => {
    const tokens = tokenize('if(1, 100, 200)');
    const parsed = parse(tokens, []);
    const result = evaluate(parsed, {});
    expect(result).toBe(100);
  });

  it('formats currency', () => {
    expect(formatResult(1234.56, { format: 'currency', decimals: 2, formula: '', fields: [] })).toContain('$');
  });

  it('formats percent', () => {
    expect(formatResult(50, { format: 'percent', decimals: 0, formula: '', fields: [] })).toBe('50%');
  });

  it('formats number with prefix/suffix', () => {
    expect(formatResult(100, { prefix: '$', suffix: ' USD', formula: '', fields: [] })).toBe('$100 USD');
  });
});