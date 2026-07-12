import { describe, expect, it } from 'vitest';
import { normalizeGetMonthlyData } from './normalizers';
import { MonthlyDataTypes, type MonthlyData } from './monthlyData.types';

const entry = (overrides: Partial<MonthlyData>): MonthlyData => ({
  id: '1',
  yearMonth: '2026-07',
  type: MonthlyDataTypes.Expense,
  amountCad: '100',
  amountUsd: '50',
  ...overrides,
});

describe('normalizeGetMonthlyData', () => {
  it('returns all entries unfiltered when no type is given', () => {
    const data = [
      entry({ id: '1', type: MonthlyDataTypes.Expense }),
      entry({ id: '2', type: MonthlyDataTypes.Income }),
    ];
    expect(normalizeGetMonthlyData(data)).toHaveLength(2);
  });

  it('filters to income entries when type is Income', () => {
    const data = [
      entry({ id: '1', type: MonthlyDataTypes.Expense }),
      entry({ id: '2', type: MonthlyDataTypes.Income }),
    ];
    const result = normalizeGetMonthlyData(data, MonthlyDataTypes.Income);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('strips isNew and only keeps the known fields', () => {
    const data = [{ ...entry({}), isNew: true } as MonthlyData & { isNew: boolean }];
    const result = normalizeGetMonthlyData(data);
    expect(result[0]).toEqual({
      id: '1',
      yearMonth: '2026-07',
      type: MonthlyDataTypes.Expense,
      amountCad: '100',
      amountUsd: '50',
    });
  });

  it('returns an empty array for falsy input', () => {
    expect(normalizeGetMonthlyData(undefined as unknown as MonthlyData[])).toEqual([]);
  });
});
