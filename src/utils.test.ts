import { describe, expect, it } from 'vitest';
import {
  dateForDayOfMonth,
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
  it('formats a Date value as mm / dd / yy (thin-spaced slashes) using local fields', () => {
    expect(formatDate(new Date(2026, 6, 5))).toBe('07\u2009/\u200905\u2009/\u200926');
  });

  it('formats a date string value', () => {
    expect(formatDate('2026-01-09T00:00:00.000Z')).toBe('01\u2009/\u200909\u2009/\u200926');
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

describe('dateForDayOfMonth', () => {
  it('uses the day as-is when the month has it', () => {
    expect(dateForDayOfMonth(2026, 3, 31)).toEqual(new Date(2026, 2, 31));
  });

  it('clamps day 31 to the last day of a 30-day month', () => {
    expect(dateForDayOfMonth(2026, 4, 31)).toEqual(new Date(2026, 3, 30));
  });

  it('clamps to Feb 28 in a non-leap year and Feb 29 in a leap year', () => {
    expect(dateForDayOfMonth(2026, 2, 29)).toEqual(new Date(2026, 1, 28));
    expect(dateForDayOfMonth(2026, 2, 30)).toEqual(new Date(2026, 1, 28));
    expect(dateForDayOfMonth(2028, 2, 29)).toEqual(new Date(2028, 1, 29));
    expect(dateForDayOfMonth(2028, 2, 31)).toEqual(new Date(2028, 1, 29));
  });
});
