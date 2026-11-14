/**
 * Tokenizer for math expressions
 */

export type Token =
  | { type: 'number'; value: number }
  | { type: 'identifier'; name: string }
  | { type: 'operator'; value: string }
  | { type: 'function'; name: string }
  | { type: 'paren'; value: '(' | ')' }
  | { type: 'comma' };

export const OPERATORS: Record<string, { precedence: number; associativity: 'left' | 'right' }> = {
  '||': { precedence: 1, associativity: 'left' },
  '&&': { precedence: 2, associativity: 'left' },
  '==': { precedence: 3, associativity: 'left' },
  '!=': { precedence: 3, associativity: 'left' },
  '===': { precedence: 3, associativity: 'left' },
  '!==': { precedence: 3, associativity: 'left' },
  '<': { precedence: 4, associativity: 'left' },
  '<=': { precedence: 4, associativity: 'left' },
  '>': { precedence: 4, associativity: 'left' },
  '>=': { precedence: 4, associativity: 'left' },
  '+': { precedence: 5, associativity: 'left' },
  '-': { precedence: 5, associativity: 'left' },
  '*': { precedence: 6, associativity: 'left' },
  '/': { precedence: 6, associativity: 'left' },
  '%': { precedence: 6, associativity: 'left' },
  '**': { precedence: 7, associativity: 'right' },
  '!': { precedence: 8, associativity: 'right' },
};

export const FUNCTIONS = new Set([
  'abs', 'ceil', 'floor', 'round', 'min', 'max', 'sqrt', 'pow',
  'sin', 'cos', 'tan', 'log', 'ln', 'exp',
  'if', 'sum', 'avg', 'count',
]);

export function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  
  while (i < formula.length) {
    const char = formula[i];
    
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    if (/[0-9]/.test(char)) {
      let num = '';
      while (i < formula.length && /[0-9.]/.test(formula[i])) {
        num += formula[i++];
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }
    
    if (/[a-zA-Z_]/.test(char)) {
      let ident = '';
      while (i < formula.length && /[a-zA-Z0-9_]/.test(formula[i])) {
        ident += formula[i++];
      }
      
      if (i < formula.length && formula[i] === '(') {
        tokens.push({ type: 'function', name: ident });
      } else {
        tokens.push({ type: 'identifier', name: ident });
      }
      continue;
    }
    
    let matched = false;
    for (const op of Object.keys(OPERATORS).sort((a, b) => b.length - a.length)) {
      if (formula.slice(i, i + op.length) === op) {
        tokens.push({ type: 'operator', value: op });
        i += op.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    
    if (char === '(' || char === ')') {
      tokens.push({ type: 'paren', value: char });
      i++;
      continue;
    }
    
    if (char === ',') {
      tokens.push({ type: 'comma' });
      i++;
      continue;
    }
    
    throw new Error(`Unexpected character: ${char} at position ${i}`);
  }
  
  return tokens;
}