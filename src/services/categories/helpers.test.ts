import { describe, expect, it } from 'vitest';
import {
  getCategoriesUrl,
  getCategoryBudgetUrl,
  getCategoryByIdUrl,
  parseBudgetInput,
} from './helpers';

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

describe('parseBudgetInput', () => {
  it('parses a literal 0 as an explicit zero budget, not as unset', () => {
    expect(parseBudgetInput('0')).toBe(0);
  });

  it('parses a positive number', () => {
    expect(parseBudgetInput('120.5')).toBe(120.5);
  });

  it('treats an empty string as clearing the budget', () => {
    expect(parseBudgetInput('')).toBeNull();
  });

  it('treats whitespace-only input as clearing the budget', () => {
    expect(parseBudgetInput('   ')).toBeNull();
  });
});
