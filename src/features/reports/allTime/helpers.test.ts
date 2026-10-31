import type { RecurringIncomeData } from '../../../services/recurringIncome/recurringIncomeApi.types';
import { getRecurringWealthOptions } from './helpers';
import { describe, expect, it } from 'vitest';
import { groupMonthlyData, getYAxisMax } from './helpers';
import {
  MonthlyDataTypes,
  type MonthlyData,
} from '../../../services/monthlyData/monthlyData.types';

const entry = (overrides: Partial<MonthlyData>): MonthlyData => ({
  id: 'x',
  yearMonth: '2026-01',
  type: MonthlyDataTypes.Expense,
  amountCad: '0',
  amountUsd: '0',
  ...overrides,
});

describe('getYAxisMax', () => {
  it('adds 10% headroom above the highest amount across both currencies, rounded up to the nearest 100', () => {
    const data = [
      { yearMonth: '2026-01', amountCad: 4000, amountUsd: 100 },
      { yearMonth: '2026-02', amountCad: 500, amountUsd: 5000 },
    ];

    // 5000 * 1.1 = 5500, already a round hundred
    expect(getYAxisMax(data)).toBe(5500);
  });

  it('rounds a non-round padded value up to the next hundred', () => {
    const data = [{ yearMonth: '2026-01', amountCad: 123, amountUsd: 0 }];

    // 123 * 1.1 = 135.3, rounds up to 200
    expect(getYAxisMax(data)).toBe(200);
  });

  it('falls back to a default when every amount is zero', () => {
    const data = [{ yearMonth: '2026-01', amountCad: 0, amountUsd: 0 }];

    expect(getYAxisMax(data)).toBe(100);
  });

  it('returns the default for an empty dataset', () => {
    expect(getYAxisMax([])).toBe(100);
  });
});

describe('groupMonthlyData', () => {
  it('filters to the requested type only', () => {
    const data = [
      entry({ type: MonthlyDataTypes.Expense, yearMonth: '2026-01', amountCad: '100' }),
      entry({ type: MonthlyDataTypes.Income, yearMonth: '2026-01', amountCad: '500' }),
    ];

    expect(groupMonthlyData(MonthlyDataTypes.Expense, data)).toEqual([
      { yearMonth: '2026-01', amountCad: 100, amountUsd: 0 },
    ]);
  });

  it('sums duplicate entries for the same yearMonth', () => {
    const data = [
      entry({ yearMonth: '2026-01', amountCad: '100', amountUsd: '10' }),
      entry({ yearMonth: '2026-01', amountCad: '50', amountUsd: '5' }),
    ];

    expect(groupMonthlyData(MonthlyDataTypes.Expense, data)).toEqual([
      { yearMonth: '2026-01', amountCad: 150, amountUsd: 15 },
    ]);
  });

  it('sorts ascending by year then month', () => {
    const data = [
      entry({ yearMonth: '2026-03', amountCad: '10' }),
      entry({ yearMonth: '2025-12', amountCad: '20' }),
      entry({ yearMonth: '2026-01', amountCad: '30' }),
    ];

    expect(groupMonthlyData(MonthlyDataTypes.Expense, data).map((e) => e.yearMonth)).toEqual([
      '2025-12',
      '2026-01',
      '2026-03',
    ]);
  });

  it('drops months where both currencies are zero', () => {
    const data = [
      entry({ yearMonth: '2026-01', amountCad: '0', amountUsd: '0' }),
      entry({ yearMonth: '2026-02', amountCad: '10', amountUsd: '0' }),
    ];

    expect(groupMonthlyData(MonthlyDataTypes.Expense, data).map((e) => e.yearMonth)).toEqual([
      '2026-02',
    ]);
  });

  it('returns an empty array with no data', () => {
    expect(groupMonthlyData(MonthlyDataTypes.Expense, undefined)).toEqual([]);
  });
});

describe('recurring wealth helpers', () => {
  const recurring = [
    { id: '1', category: 'bankAccounts', description: '', currency: 'USD', amount: 1 },
    { id: '2', category: 'bankAccounts', description: 'other', currency: 'USD', amount: 2 },
    { id: '3', category: 'bankAccounts', description: '', currency: 'CAD', amount: 1 },
    { id: '4', category: 'cash', description: '', currency: 'USD', amount: 1 },
  ] as unknown as RecurringIncomeData[];

  it('builds sorted "category - currency" options, one per distinct pair', () => {
    expect(getRecurringWealthOptions(recurring).map((o) => o.label)).toEqual([
      'Bank Accounts - CAD',
      'Bank Accounts - USD',
      'Cash - USD',
    ]);
  });

  it('carries the category and currency to send to the BE as filters', () => {
    const usd = getRecurringWealthOptions(recurring).find((o) => o.label === 'Bank Accounts - USD');
    expect(usd).toMatchObject({ category: 'bankAccounts', currency: 'USD' });
  });

  it('falls back to the raw category when it has no known label', () => {
    const [option] = getRecurringWealthOptions([
      { id: '1', category: 'collectibles', description: '', currency: 'USD', amount: 1 },
    ] as unknown as RecurringIncomeData[]);
    expect(option.label).toBe('collectibles - USD');
  });

  it('returns no options without recurring entries', () => {
    expect(getRecurringWealthOptions(undefined)).toEqual([]);
  });
});
