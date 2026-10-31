import { describe, expect, it } from 'vitest';
import { getMonthlyDataUrl, getYearlyComparisonUrl } from './helpers';
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

describe('getYearlyComparisonUrl', () => {
  it('builds the query with mode and base currency', () => {
    expect(getYearlyComparisonUrl({ mode: 'full-year', baseCurrency: 'USD' })).toBe(
      'reports/yearly-comparison?mode=full-year&baseCurrency=USD',
    );
  });

  it('encodes cutoffs, using "none" for a year that is left out', () => {
    const url = getYearlyComparisonUrl({
      mode: 'ytd',
      baseCurrency: 'CAD',
      cutoffs: { 2026: 3, 2025: null },
    });
    expect(decodeURIComponent(url)).toBe(
      'reports/yearly-comparison?mode=ytd&baseCurrency=CAD&cutoffs=2025:none,2026:3',
    );
  });
});
