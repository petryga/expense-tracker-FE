import { describe, expect, it } from 'vitest';
import { getIncomeEntriesByIdUrl, getIncomeEntriesUrl } from './helpers';

describe('income URL helpers', () => {
  it('getIncomeEntriesUrl', () => {
    expect(getIncomeEntriesUrl()).toBe('/income');
  });

  it('getIncomeEntriesByIdUrl', () => {
    expect(getIncomeEntriesByIdUrl('abc-123')).toBe('/income/abc-123');
  });
});
