import { describe, expect, it } from 'vitest';
import { decorateReport } from './helpers';
import type { MonthlyReport } from '../../../services/monthlyData/monthlyData.types';

const report: MonthlyReport = {
  yearMonth: '2026-10',
  totalSpentCad: 15,
  totalSpentUsd: 70,
  dataByCategory: [
    { category: 'Rent', total: 100, details: [{ description: 'r', amount: 100, currency: 'USD' }] },
    { category: 'Groceries', total: 50, details: [] },
  ],
};

describe('decorateReport', () => {
  it('returns an empty result with no report', () => {
    expect(decorateReport(undefined)).toEqual({
      dataByCategory: [],
      totalSpentCad: 0,
      totalSpentUsd: 0,
    });
  });

  it('keeps the BE order and totals and gives each category a distinct colour', () => {
    const result = decorateReport(report);

    expect(result.dataByCategory.map((c) => c.category)).toEqual(['Rent', 'Groceries']);
    expect(result.totalSpentCad).toBe(15);
    expect(result.totalSpentUsd).toBe(70);
    expect(result.dataByCategory[0].fill).toBeTruthy();
    expect(result.dataByCategory[0].fill).not.toBe(result.dataByCategory[1].fill);
  });

  it('attaches the matching budget and null when there is none', () => {
    const result = decorateReport(report, { Rent: 1200 });

    expect(result.dataByCategory.find((c) => c.category === 'Rent')?.budget).toBe(1200);
    expect(result.dataByCategory.find((c) => c.category === 'Groceries')?.budget).toBeNull();
  });
});
