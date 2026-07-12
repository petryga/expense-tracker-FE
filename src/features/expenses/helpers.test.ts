import { describe, expect, it } from 'vitest';
import { format } from 'date-fns';
import {
  buildCategoryTree,
  Currency,
  getCurrentMonthPath,
  getDataByMonth,
  processExpensesData,
} from './helpers';
import type { Data } from '../../services/expenses/expensesApi.types';
import type { CategoryRecord } from '../../services/categories/categoriesApi.types';

const makeExpense = (overrides: Partial<Data>): Data => ({
  datePosted: '2026-07-11',
  account: 'Amex',
  description: 'Test',
  category: 'Groceries',
  amount: 10,
  currency: Currency.USD,
  ...overrides,
});

describe('buildCategoryTree', () => {
  it('nests subcategories under their parent by parentCategoryId', () => {
    const records: CategoryRecord[] = [
      { id: '1', name: 'Bills', parentCategoryId: null, isDefault: true, budget: null },
      { id: '101', name: 'Rent', parentCategoryId: '1', isDefault: true, budget: null },
      { id: '102', name: 'Electricity', parentCategoryId: '1', isDefault: true, budget: 60 },
      { id: '2', name: 'Fees', parentCategoryId: null, isDefault: false, budget: null },
    ];

    expect(buildCategoryTree(records)).toEqual([
      {
        id: '1',
        name: 'Bills',
        subcategories: [
          { id: '101', name: 'Rent' },
          { id: '102', name: 'Electricity' },
        ],
      },
      { id: '2', name: 'Fees', subcategories: [] },
    ]);
  });

  it('returns an empty array for no records', () => {
    expect(buildCategoryTree([])).toEqual([]);
  });
});

describe('getDataByMonth', () => {
  it('groups expenses by year-month, sorted descending', () => {
    const expenses = [
      makeExpense({ datePosted: '2026-05-01' }),
      makeExpense({ datePosted: '2026-07-11' }),
      makeExpense({ datePosted: '2026-05-15' }),
    ];

    const result = getDataByMonth(expenses);

    expect(Object.keys(result)).toEqual(['2026-07', '2026-05']);
    expect(result['2026-05']).toHaveLength(2);
    expect(result['2026-07']).toHaveLength(1);
  });

  it('returns the current month with an empty array when there is no data', () => {
    const result = getDataByMonth([]);
    const currentMonth = new Date().toISOString().slice(0, 7);
    expect(result).toEqual({ [currentMonth]: [] });
  });
});

describe('processExpensesData', () => {
  const [currentYear, currentMonth] = new Date().toISOString().slice(0, 7).split('-');

  it('nests expenses by year then month', () => {
    // A far-past date so it can never collide with "today"'s real
    // year/month, which processExpensesData always injects (see below).
    const expenses = [
      makeExpense({ datePosted: '2019-07-11' }),
      makeExpense({ datePosted: '2018-12-01' }),
    ];

    const result = processExpensesData(expenses);

    expect(result['2019']['07']).toHaveLength(1);
    expect(result['2018']['12']).toHaveLength(1);
  });

  it('keeps the current month reachable even when only other months have data', () => {
    // This is the actual bug this behavior fixes: without it, the current
    // month disappears from the year/month navigation entirely once you've
    // browsed to a different month, since it only listed months that had
    // real expenses.
    const expenses = [makeExpense({ datePosted: '2019-07-11' })];

    const result = processExpensesData(expenses);

    expect(result[currentYear]?.[currentMonth]).toEqual([]);
  });

  it('returns just the current month, empty, when there is no data at all', () => {
    const result = processExpensesData([]);
    expect(result).toEqual({ [currentYear]: { [currentMonth]: [] } });
  });
});

describe('getCurrentMonthPath', () => {
  it('builds an /expenses/yyyy-MM path for the current month', () => {
    expect(getCurrentMonthPath()).toBe(`/expenses/${format(new Date(), 'yyyy-MM')}`);
  });
});
