/**
 * Parser (Shunting-yard algorithm) for math expressions
 */

import type { Token } from './tokenizer.js';
import { OPERATORS } from './tokenizer.js';

export interface ParsedExpression {
  tokens: Token[];
  dependencies: string[];
}

export function parse(tokens: Token[], fieldIds: string[]): ParsedExpression {
  const { output } = shuntingYard(tokens);
  const dependencies = extractDependencies(output, fieldIds);
  return { tokens: output, dependencies };
}

function shuntingYard(tokens: Token[]): { output: Token[]; ops: Token[] } {
  const output: Token[] = [];
  const ops: Token[] = [];
  
  for (const token of tokens) {
    switch (token.type) {
      case 'number':
      case 'identifier':
        output.push(token);
        break;
        
      case 'function':
        ops.push(token);
        break;
        
      case 'operator': {
        const o1 = token;
        while (ops.length > 0) {
          const o2 = ops[ops.length - 1];
          if (o2.type === 'operator' && (
            (OPERATORS[o1.value].associativity === 'left' && OPERATORS[o1.value].precedence <= OPERATORS[o2.value].precedence) ||
            (OPERATORS[o1.value].associativity === 'right' && OPERATORS[o1.value].precedence < OPERATORS[o2.value].precedence)
          )) {
            output.push(ops.pop()!);
          } else {
            break;
          }
        }
        ops.push(o1);
        break;
      }
        
      case 'paren':
        if (token.value === '(') {
          ops.push(token);
        } else {
          while (ops.length > 0 && ops[ops.length - 1].type !== 'paren') {
            output.push(ops.pop()!);
          }
          if (ops.length === 0) throw new Error('Mismatched parentheses');
          ops.pop();
          
          if (ops.length > 0 && ops[ops.length - 1].type === 'function') {
            output.push(ops.pop()!);
          }
        }
        break;
        
      case 'comma':
        while (ops.length > 0 && ops[ops.length - 1].type !== 'paren') {
          output.push(ops.pop()!);
        }
        if (ops.length === 0) throw new Error('Misplaced comma');
        break;
    }
  }
  
  while (ops.length > 0) {
    const op = ops.pop()!;
    if (op.type === 'paren') throw new Error('Mismatched parentheses');
    output.push(op);
  }
  
  return { output, ops: [] };
}

function extractDependencies(tokens: Token[], fieldIds: string[]): string[] {
  const deps = new Set<string>();
  const fieldIdSet = new Set(fieldIds);
  
  for (const token of tokens) {
    if (token.type === 'identifier' && fieldIdSet.has(token.name)) {
      deps.add(token.name);
    }
  }
  
  return Array.from(deps);
}