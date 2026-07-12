import { describe, expect, it } from 'vitest';
import { getMonthlyDataUrl } from './helpers';

describe('getMonthlyDataUrl', () => {
  it('returns the monthlyData path', () => {
    expect(getMonthlyDataUrl()).toBe('monthlyData');
  });
});
