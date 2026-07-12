import { describe, expect, it } from 'vitest';
import { getRecurringExpensesByIdUrl, getRecurringExpensesUrl } from './helpers';

describe('recurring expenses URL helpers', () => {
  it('getRecurringExpensesUrl', () => {
    expect(getRecurringExpensesUrl()).toBe('/recurringExpenses');
  });

  it('getRecurringExpensesByIdUrl', () => {
    expect(getRecurringExpensesByIdUrl('abc-123')).toBe('/recurringExpenses/abc-123');
  });
});
