import { describe, expect, it } from 'vitest';
import { normalizeGetAllExpensesData, normalizeGetAllSearchedData } from './normalizers';
import type { NewDataResponse } from './expensesApi.types';
import { Currency } from '../../features/expenses/helpers';

const makeResponse = (overrides: Partial<NewDataResponse>): NewDataResponse => ({
  data: [
    {
      id: '1',
      datePosted: '2026-07-11',
      account: 'Amex',
      description: 'Test',
      category: 'Groceries',
      amount: '42.50',
      year: 2026,
      month: 7,
      currency: Currency.USD,
    },
  ],
  expensesTotal: {
    totalAmountThisMonthCad: 100,
    totalAmountThisMonthUsd: 200,
    totalAmountAllTime: 5000,
  },
  ...overrides,
});

describe('normalizeGetAllExpensesData', () => {
  it('parses string amounts into numbers', () => {
    const result = normalizeGetAllExpensesData(makeResponse({}));
    expect(result.data[0].amount).toBe(42.5);
  });

  it('carries through the monthly and all-time totals', () => {
    const result = normalizeGetAllExpensesData(makeResponse({}));
    expect(result.expensesTotal).toEqual({
      totalAmountThisMonthCad: 100,
      totalAmountThisMonthUsd: 200,
      totalAmountAllTime: 5000,
    });
  });

  it('defaults missing totals to 0', () => {
    const result = normalizeGetAllExpensesData(
      makeResponse({
        expensesTotal: {
          totalAmountThisMonthCad: 0,
          totalAmountThisMonthUsd: 0,
          totalAmountAllTime: undefined as unknown as number,
        },
      })
    );
    expect(result.expensesTotal.totalAmountAllTime).toBe(0);
  });

  it('returns an empty result for falsy input', () => {
    expect(normalizeGetAllExpensesData(undefined as unknown as NewDataResponse)).toEqual({
      data: [],
      expensesTotal: {
        totalAmountThisMonthCad: 0,
        totalAmountThisMonthUsd: 0,
        totalAmountAllTime: 0,
      },
    });
  });
});

describe('normalizeGetAllSearchedData', () => {
  it('parses string amounts into numbers and carries through search totals', () => {
    const result = normalizeGetAllSearchedData(
      makeResponse({
        expensesTotal: {
          totalAmountThisMonthCad: 0,
          totalAmountThisMonthUsd: 0,
          totalAmountAllTime: 0,
          totalAmountSearchResultsCad: 42,
          totalAmountSearchResultsUsd: 84,
        },
      })
    );

    expect(result.data[0].amount).toBe(42.5);
    expect(result.expensesTotal.totalAmountSearchResultsCad).toBe(42);
    expect(result.expensesTotal.totalAmountSearchResultsUsd).toBe(84);
  });

  it('returns an empty result when there is no data array', () => {
    const result = normalizeGetAllSearchedData({ data: undefined as any, expensesTotal: {} as any });
    expect(result.data).toEqual([]);
    expect(result.expensesTotal.totalAmountSearchResultsCad).toBe(0);
  });
});
