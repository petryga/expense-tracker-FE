import { describe, expect, it } from 'vitest';
import {
  formatAmount,
  formatDate,
  formatNumberWithCommas,
  stripCommas,
  stripLeadingZero,
  transformCategoriesForDropdown,
} from './utils';
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

describe('formatNumberWithCommas', () => {
  it('adds thousands separators to a plain integer', () => {
    expect(formatNumberWithCommas(1234567)).toBe('1,234,567');
  });

  it('adds thousands separators while preserving a decimal part', () => {
    expect(formatNumberWithCommas('1234.5')).toBe('1,234.5');
  });

  it('handles negative numbers', () => {
    expect(formatNumberWithCommas('-1234.5')).toBe('-1,234.5');
  });

  it('leaves values under 1000 unchanged', () => {
    expect(formatNumberWithCommas('42.5')).toBe('42.5');
  });

  it('leaves a non-numeric expression untouched', () => {
    expect(formatNumberWithCommas('20+5')).toBe('20+5');
  });

  it('leaves an empty string or a bare minus sign untouched', () => {
    expect(formatNumberWithCommas('')).toBe('');
    expect(formatNumberWithCommas('-')).toBe('-');
  });
});

describe('stripCommas', () => {
  it('removes commas from a formatted number', () => {
    expect(stripCommas('1,234,567.89')).toBe('1234567.89');
  });

  it('leaves a string with no commas unchanged', () => {
    expect(stripCommas('1234.89')).toBe('1234.89');
  });
});

describe('stripLeadingZero', () => {
  it('drops a redundant leading zero before another digit', () => {
    expect(stripLeadingZero('05')).toBe('5');
  });

  it('collapses multiple leading zeros down to the significant digits', () => {
    expect(stripLeadingZero('001')).toBe('1');
    expect(stripLeadingZero('00')).toBe('0');
  });

  it('preserves the sign on a negative number', () => {
    expect(stripLeadingZero('-05')).toBe('-5');
  });

  it('leaves a lone zero untouched', () => {
    expect(stripLeadingZero('0')).toBe('0');
  });

  it('leaves an in-progress decimal untouched', () => {
    expect(stripLeadingZero('0.')).toBe('0.');
    expect(stripLeadingZero('0.5')).toBe('0.5');
  });

  it('leaves a number with no leading zero untouched', () => {
    expect(stripLeadingZero('10')).toBe('10');
  });

  it('leaves an empty string untouched', () => {
    expect(stripLeadingZero('')).toBe('');
  });
});

describe('formatAmount', () => {
  it('formats a large amount with commas, dropping trailing decimal zeros', () => {
    expect(formatAmount(1234567.5)).toBe('1,234,567.5');
  });

  it('drops a whole-number amount entirely', () => {
    expect(formatAmount(42)).toBe('42');
  });

  it('drops a trailing ".00" for a whole number with commas', () => {
    expect(formatAmount(1234)).toBe('1,234');
  });

  it('keeps a non-trailing-zero decimal', () => {
    expect(formatAmount(1234.56)).toBe('1,234.56');
  });

  it('keeps a single significant decimal but drops its trailing zero', () => {
    expect(formatAmount(1234.5)).toBe('1,234.5');
  });

  it('treats null/undefined as zero', () => {
    expect(formatAmount(null)).toBe('0');
    expect(formatAmount(undefined)).toBe('0');
  });
});
