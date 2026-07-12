import { describe, expect, it, vi } from 'vitest';
import { evaluateExpression } from './AmountTableCell';

describe('evaluateExpression', () => {
  it('evaluates a plain number', () => {
    expect(evaluateExpression('42.5')).toBe(42.5);
  });

  it('evaluates a simple arithmetic expression', () => {
    expect(evaluateExpression('20+5')).toBe(25);
  });

  it('evaluates an expression with multiplication and parentheses', () => {
    expect(evaluateExpression('(2+3)*4')).toBe(20);
  });

  it('returns the original string and logs an error for an unevaluatable expression', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(evaluateExpression('not valid js;;;')).toBe('not valid js;;;');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
