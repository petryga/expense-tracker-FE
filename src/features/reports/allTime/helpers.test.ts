import { describe, expect, it } from 'vitest';
import { buildYearlyComparisonData, groupMonthlyData, getYAxisMax } from './helpers';
import { MonthlyDataTypes, type MonthlyData } from '../../../services/monthlyData/monthlyData.types';
import { Currency } from '../../expenses/helpers';
import type { FxRateConfig } from '../../../utils/currency';

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

describe('buildYearlyComparisonData', () => {
  const rates: FxRateConfig = { defaultCadToUsd: 0.5 };

  it('full-year mode sums all months and flags years with fewer than 12 months as incomplete', () => {
    const data = [
      entry({ yearMonth: '2026-01', amountCad: '100' }),
      entry({ yearMonth: '2026-02', amountCad: '200' }),
    ];

    const result = buildYearlyComparisonData({
      data,
      mode: 'full-year',
      baseCurrency: Currency.CAD,
      rates,
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      year: 2026,
      amountCad: 300,
      monthsCount: 2,
      isIncomplete: true,
      cutoffMonth: null,
    });
  });

  it('ytd mode defaults the cutoff to the latest month present that year', () => {
    const data = [
      entry({ yearMonth: '2026-01', amountCad: '100' }),
      entry({ yearMonth: '2026-03', amountCad: '100' }),
    ];

    const result = buildYearlyComparisonData({
      data,
      mode: 'ytd',
      baseCurrency: Currency.CAD,
      rates,
    });

    expect(result.defaultYtdCutoffByYear[2026]).toBe(3);
    expect(result.rows[0].cutoffMonth).toBe(3);
    expect(result.rows[0].monthsCount).toBe(2);
  });

  it('ytd mode respects an explicit cutoff, excluding later months', () => {
    const data = [
      entry({ yearMonth: '2026-01', amountCad: '100' }),
      entry({ yearMonth: '2026-02', amountCad: '100' }),
      entry({ yearMonth: '2026-03', amountCad: '100' }),
    ];

    const result = buildYearlyComparisonData({
      data,
      mode: 'ytd',
      baseCurrency: Currency.CAD,
      rates,
      ytdCutoffByYear: { 2026: 2 },
    });

    expect(result.rows[0].cutoffMonth).toBe(2);
    expect(result.rows[0].amountCad).toBe(200);
    expect(result.rows[0].monthsCount).toBe(2);
  });

  it('ytd mode excludes a year explicitly set to a null cutoff', () => {
    const data = [entry({ yearMonth: '2026-01', amountCad: '100' })];

    const result = buildYearlyComparisonData({
      data,
      mode: 'ytd',
      baseCurrency: Currency.CAD,
      rates,
      ytdCutoffByYear: { 2026: null },
    });

    expect(result.rows).toEqual([]);
  });

  it('converts totals into the requested base currency', () => {
    const data = [entry({ yearMonth: '2026-01', amountCad: '0', amountUsd: '100' })];

    const result = buildYearlyComparisonData({
      data,
      mode: 'full-year',
      baseCurrency: Currency.CAD,
      rates,
    });

    // 100 USD -> CAD at a 0.5 CAD-to-USD rate is 100 / 0.5 = 200 CAD
    expect(result.rows[0].convertedTotal).toBe(200);
  });

  it('returns an empty result with no expense data', () => {
    const result = buildYearlyComparisonData({
      data: [],
      mode: 'full-year',
      baseCurrency: Currency.CAD,
      rates,
    });

    expect(result).toEqual({ rows: [], ytdCutoffOptionsByYear: {}, defaultYtdCutoffByYear: {} });
  });
});
