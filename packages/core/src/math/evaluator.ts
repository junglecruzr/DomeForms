/**
 * Evaluator for parsed math expressions
 */

import type { Token, ParsedExpression } from './index.js';
import type { CalculationConfig } from '../types/calculation.js';

export function evaluate(parsed: ParsedExpression, values: Record<string, unknown>): number {
  const stack: unknown[] = [];
  
  for (const token of parsed.tokens) {
    switch (token.type) {
      case 'number':
        stack.push(token.value);
        break;
        
      case 'identifier': {
        const value = values[token.name];
        stack.push(typeof value === 'number' ? value : Number(value) || 0);
        break;
      }
      
      case 'operator': {
        if (token.value === '!') {
          const a = stack.pop();
          stack.push(!a ? 1 : 0);
        } else {
          const b = stack.pop();
          const a = stack.pop();
          const numA = Number(a);
          const numB = Number(b);
          let result: number;
          
          switch (token.value) {
            case '+': result = numA + numB; break;
            case '-': result = numA - numB; break;
            case '*': result = numA * numB; break;
            case '/': result = numB !== 0 ? numA / numB : 0; break;
            case '%': result = numA % numB; break;
            case '**': result = Math.pow(numA, numB); break;
            case '==': result = numA == numB ? 1 : 0; break;
            case '!=': result = numA != numB ? 1 : 0; break;
            case '===': result = numA === numB ? 1 : 0; break;
            case '!==': result = numA !== numB ? 1 : 0; break;
            case '<': result = numA < numB ? 1 : 0; break;
            case '<=': result = numA <= numB ? 1 : 0; break;
            case '>': result = numA > numB ? 1 : 0; break;
            case '>=': result = numA >= numB ? 1 : 0; break;
            case '&&': result = numA && numB ? 1 : 0; break;
            case '||': result = numA || numB ? 1 : 0; break;
            default: throw new Error(`Unknown operator: ${token.value}`);
          }
          stack.push(result);
        }
        break;
      }
      
      case 'function': {
        const func = token.name;
        let result = 0;
        
        switch (func) {
          case 'abs': result = Math.abs(stack.pop() as number); break;
          case 'ceil': result = Math.ceil(stack.pop() as number); break;
          case 'floor': result = Math.floor(stack.pop() as number); break;
          case 'round': result = Math.round(stack.pop() as number); break;
          case 'sqrt': result = Math.sqrt(stack.pop() as number); break;
          case 'pow': {
            const exp = stack.pop() as number;
            const base = stack.pop() as number;
            result = Math.pow(base, exp);
            break;
          }
          case 'min': result = Math.min(...(stack.splice(-2) as number[])); break;
          case 'max': result = Math.max(...(stack.splice(-2) as number[])); break;
          case 'sin': result = Math.sin(stack.pop() as number); break;
          case 'cos': result = Math.cos(stack.pop() as number); break;
          case 'tan': result = Math.tan(stack.pop() as number); break;
          case 'log': result = Math.log10(stack.pop() as number); break;
          case 'ln': result = Math.log(stack.pop() as number); break;
          case 'exp': result = Math.exp(stack.pop() as number); break;
          case 'if': {
            const falseVal = stack.pop() as number;
            const trueVal = stack.pop() as number;
            const cond = stack.pop() as number;
            result = cond ? trueVal : falseVal;
            break;
          }
          case 'sum': {
            const count = stack.pop() as number;
            const vals = stack.splice(-count) as number[];
            result = vals.reduce((a, b) => a + b, 0);
            break;
          }
          case 'avg': {
            const count = stack.pop() as number;
            const vals = stack.splice(-count) as number[];
            result = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
            break;
          }
          case 'count': {
            const count = stack.pop() as number;
            result = count;
            break;
          }
          default:
            throw new Error(`Unknown function: ${func}`);
        }
        stack.push(result);
        break;
      }
    }
  }
  
  if (stack.length !== 1) {
    throw new Error('Invalid expression');
  }
  
  return stack[0] as number;
}

export function formatResult(value: number, config: CalculationConfig): string {
  let formatted: string;
  
  if (config.format === 'currency') {
    formatted = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: config.decimals ?? 2,
      maximumFractionDigits: config.decimals ?? 2,
    }).format(value);
  } else if (config.format === 'percent') {
    formatted = new Intl.NumberFormat(config.locale, {
      style: 'percent',
      minimumFractionDigits: config.decimals ?? 0,
      maximumFractionDigits: config.decimals ?? 0,
    }).format(value / 100);
  } else {
    formatted = Number(value.toFixed(config.decimals ?? 2)).toString();
  }
  
  return `${config.prefix ?? ''}${formatted}${config.suffix ?? ''}`;
}