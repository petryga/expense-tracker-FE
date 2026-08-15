import { describe, expect, it } from 'vitest';
import { formatDate, transformCategoriesForDropdown } from './utils';
import type { Category } from './features/expenses/ExpensesPage.types';

describe('transformCategoriesForDropdown', () => {
  it('flattens categories into "Category - Subcategory" options', () => {
    const categories: Category[] = [
      {
        id: '1',
        name: 'Bills',
        subcategories: [
          { id: '101', name: 'Rent' },
          { id: '102', name: 'Electricity' },
        ],
      },
      {
        id: '2',
        name: 'Fees',
        subcategories: [{ id: '201', name: 'Financial Fees' }],
      },
    ];

    expect(transformCategoriesForDropdown(categories)).toEqual([
      { value: 'Rent', label: 'Bills - Rent' },
      { value: 'Electricity', label: 'Bills - Electricity' },
      { value: 'Financial Fees', label: 'Fees - Financial Fees' },
    ]);
  });

  it('returns an empty array for a category with no subcategories', () => {
    const categories: Category[] = [{ id: '1', name: 'Empty', subcategories: [] }];
    expect(transformCategoriesForDropdown(categories)).toEqual([]);
  });

  it('returns an empty array for no categories', () => {
    expect(transformCategoriesForDropdown([])).toEqual([]);
  });
});

describe('formatDate', () => {
  it('formats a Date value as yyyy/mm/dd using local fields', () => {
    expect(formatDate(new Date(2026, 6, 5))).toBe('2026/07/05');
  });

  it('formats a date string value', () => {
    expect(formatDate('2026-01-09T00:00:00.000Z')).toBe('2026/01/09');
  });
});
