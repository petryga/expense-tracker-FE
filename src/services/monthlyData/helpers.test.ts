import { describe, expect, it } from 'vitest';
import { getMonthlyDataUrl } from './helpers';
import { MonthlyDataTypes } from './monthlyData.types';

describe('getMonthlyDataUrl', () => {
  it('returns the monthlyData path', () => {
    expect(getMonthlyDataUrl()).toBe('monthlyData');
    expect(getMonthlyDataUrl({})).toBe('monthlyData');
  });

  it('adds the type, category and currency filters as query params', () => {
    expect(
      getMonthlyDataUrl({
        type: MonthlyDataTypes.Income,
        category: 'bankAccounts',
        currency: 'USD',
      }),
    ).toBe('monthlyData?type=income&category=bankAccounts&currency=USD');
  });

  it('omits filters that are not set', () => {
    expect(getMonthlyDataUrl({ currency: 'CAD' })).toBe('monthlyData?currency=CAD');
  });

  it('encodes values', () => {
    expect(getMonthlyDataUrl({ category: 'a b&c' })).toBe('monthlyData?category=a+b%26c');
  });
});
