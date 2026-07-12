import { describe, expect, it } from 'vitest';
import { getRecurringIncomeByIdUrl, getRecurringIncomeUrl } from './helpers';

describe('recurring income URL helpers', () => {
  it('getRecurringIncomeUrl', () => {
    expect(getRecurringIncomeUrl()).toBe('/recurringIncome');
  });

  it('getRecurringIncomeByIdUrl', () => {
    expect(getRecurringIncomeByIdUrl('abc-123')).toBe('/recurringIncome/abc-123');
  });
});
