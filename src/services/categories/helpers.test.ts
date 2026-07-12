import { describe, expect, it } from 'vitest';
import { getCategoriesUrl, getCategoryBudgetUrl, getCategoryByIdUrl } from './helpers';

describe('categories URL helpers', () => {
  it('getCategoriesUrl', () => {
    expect(getCategoriesUrl()).toBe('/categories');
  });

  it('getCategoryBudgetUrl', () => {
    expect(getCategoryBudgetUrl('abc-123')).toBe('/categories/abc-123/budget');
  });

  it('getCategoryByIdUrl', () => {
    expect(getCategoryByIdUrl('abc-123')).toBe('/categories/abc-123');
  });
});
