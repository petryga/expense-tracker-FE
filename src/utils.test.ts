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
  it('formats a Date value as yyyy/mm/dd using UTC fields', () => {
    const result = formatDate({ value: new Date('2026-07-05T12:00:00.000Z') } as any);
    expect(result).toBe('2026/07/05');
  });

  it('formats a date string value', () => {
    const result = formatDate({ value: '2026-01-09T00:00:00.000Z' } as any);
    expect(result).toBe('2026/01/09');
  });
});
