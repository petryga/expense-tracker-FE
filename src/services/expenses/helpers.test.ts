import { describe, expect, it } from 'vitest';
import { getExpensesByIdUrl, getExpensesUrl } from './helpers';

describe('getExpensesUrl', () => {
  it('returns the bare path with no params', () => {
    expect(getExpensesUrl()).toBe('expenses');
  });

  it('appends a search query param', () => {
    expect(getExpensesUrl('rent')).toBe('expenses?search=rent');
  });

  it('appends a yearMonth query param', () => {
    expect(getExpensesUrl(undefined, '2026-07')).toBe('expenses?yearMonth=2026-07');
  });

  it('joins both params with "&" when search and yearMonth are given together', () => {
    expect(getExpensesUrl('rent', '2026-07')).toBe('expenses?search=rent&yearMonth=2026-07');
  });

  it('URL-encodes special characters in the search term', () => {
    expect(getExpensesUrl('rent & fees')).toBe('expenses?search=rent+%26+fees');
  });
});

describe('getExpensesByIdUrl', () => {
  it('builds the by-id path', () => {
    expect(getExpensesByIdUrl('abc-123')).toBe('expenses/abc-123');
  });
});
