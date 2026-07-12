import { describe, expect, it } from 'vitest';
import { getVisualizedData } from './helpers';
import type { Data } from '../../../services/expenses/expensesApi.types';
import { Currency } from '../../expenses/helpers';

const makeExpense = (overrides: Partial<Data> & { category: string }): Data => ({
  datePosted: '2026-07-11',
  account: 'Amex',
  description: 'Test',
  amount: 10,
  currency: Currency.USD,
  ...overrides,
});

describe('getVisualizedData', () => {
  it('returns an empty result with no data', () => {
    expect(getVisualizedData(undefined)).toEqual({
      dataByCategory: [],
      totalSpentCad: 0,
      totalSpentUsd: 0,
    });
  });

  it('groups expenses by category and sums per currency', () => {
    const data = [
      makeExpense({ category: 'Groceries', amount: 50, currency: Currency.USD }),
      makeExpense({ category: 'Groceries', amount: 20, currency: Currency.USD }),
      makeExpense({ category: 'Rent', amount: 1500, currency: Currency.CAD }),
    ];

    const result = getVisualizedData(data);

    expect(result.totalSpentUsd).toBe(70);
    expect(result.totalSpentCad).toBe(1500);
    expect(result.dataByCategory.map((c) => c.category)).toEqual(['Rent', 'Groceries']);

    const groceries = result.dataByCategory.find((c) => c.category === 'Groceries');
    expect(groceries?.total).toBe(70);
    expect(groceries?.details).toHaveLength(2);
  });

  it('excludes non-positive amounts (e.g. refunds/rewards)', () => {
    const data = [
      makeExpense({ category: 'Groceries', amount: 20 }),
      makeExpense({ category: 'Credit Card Rewards', amount: -5 }),
      makeExpense({ category: 'Groceries', amount: 0 }),
    ];

    const result = getVisualizedData(data);

    expect(result.dataByCategory).toHaveLength(1);
    expect(result.dataByCategory[0].category).toBe('Groceries');
    expect(result.dataByCategory[0].total).toBe(20);
  });

  it('attaches the matching budget for a category and null when there is none', () => {
    const data = [
      makeExpense({ category: 'Entertainment', amount: 30 }),
      makeExpense({ category: 'Groceries', amount: 20 }),
    ];

    const result = getVisualizedData(data, { Entertainment: 50 });

    const entertainment = result.dataByCategory.find((c) => c.category === 'Entertainment');
    const groceries = result.dataByCategory.find((c) => c.category === 'Groceries');
    expect(entertainment?.budget).toBe(50);
    expect(groceries?.budget).toBeNull();
  });

  it('sorts categories by total spend, descending', () => {
    const data = [
      makeExpense({ category: 'Small', amount: 5 }),
      makeExpense({ category: 'Big', amount: 500 }),
      makeExpense({ category: 'Medium', amount: 50 }),
    ];

    const result = getVisualizedData(data);
    expect(result.dataByCategory.map((c) => c.category)).toEqual(['Big', 'Medium', 'Small']);
  });
});
