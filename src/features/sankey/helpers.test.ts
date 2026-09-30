import { describe, expect, it } from 'vitest';
import {
  buildSankeyData,
  formatSignedAmount,
  sortSavingsLast,
  splitTrailingParenthetical,
} from './helpers';
import type { IncomeData } from '../../services/income/incomeApi.types';
import type { Data as ExpenseData } from '../../services/expenses/expensesApi.types';
import { IncomeCategories } from '../income/helpers';
import { Currency } from '../expenses/helpers';

const income = (overrides: Partial<IncomeData>): IncomeData => ({
  date: '2026-01-15',
  description: '',
  category: IncomeCategories.BANK_ACCOUNTS,
  amount: 1000,
  currency: Currency.USD,
  ...overrides,
});

const expense = (overrides: Partial<ExpenseData> & { category: string }): ExpenseData => ({
  datePosted: '2026-01-15',
  account: 'Amex',
  description: '',
  amount: 100,
  currency: Currency.USD,
  ...overrides,
});

describe('formatSignedAmount', () => {
  it('formats a positive amount with a leading $', () => {
    expect(formatSignedAmount(150)).toBe('$150');
  });

  it('formats a negative amount with the sign before the $', () => {
    expect(formatSignedAmount(-75)).toBe('-$75');
  });

  it('adds thousands separators', () => {
    expect(formatSignedAmount(1234)).toBe('$1,234');
  });

  it('formats zero without a sign', () => {
    expect(formatSignedAmount(0)).toBe('$0');
  });
});

describe('sortSavingsLast', () => {
  it('sorts a Savings node after a non-Savings node', () => {
    expect(sortSavingsLast({ name: 'Savings • $200' }, { name: 'Groceries • $300' })).toBe(1);
    expect(sortSavingsLast({ name: 'Groceries • $300' }, { name: 'Savings • $200' })).toBe(-1);
  });

  it('treats two non-Savings nodes as equal (preserves their existing order)', () => {
    expect(sortSavingsLast({ name: 'Rent • $500' }, { name: 'Groceries • $300' })).toBe(0);
  });

  it('treats two Savings nodes as equal', () => {
    expect(sortSavingsLast({ name: 'Savings • $200' }, { name: 'Savings • $100' })).toBe(0);
  });
});

describe('splitTrailingParenthetical', () => {
  it('splits a label with a trailing breakdown', () => {
    expect(splitTrailingParenthetical('Savings • $200 (Cash $150 / Investments $50)')).toEqual([
      'Savings • $200',
      '(Cash $150 / Investments $50)',
    ]);
  });

  it('returns the label unchanged with a null second element when there is no breakdown', () => {
    expect(splitTrailingParenthetical('Groceries • $300')).toEqual(['Groceries • $300', null]);
  });
});

describe('buildSankeyData', () => {
  it('returns an empty result with no income entries', () => {
    const result = buildSankeyData(undefined, []);
    expect(result).toEqual({
      nodes: [],
      links: [],
      monthLabel: '',
      incomeAmount: 0,
      expenseTotal: 0,
      availableMonths: [],
      cashSavings: 0,
      investmentGrowth: 0,
    });

    expect(buildSankeyData([], [])).toEqual(result);
  });

  it('ignores CRYPTO income when computing month totals (only bank/cash/investments count)', () => {
    // Two income months so the second (index > 0) is eligible; both need
    // expenses to land in monthsWithExpenses.
    const incomeEntries = [
      income({ date: '2026-01-10', category: IncomeCategories.BANK_ACCOUNTS, amount: 1000 }),
      income({ date: '2026-02-10', category: IncomeCategories.BANK_ACCOUNTS, amount: 1000 }),
      income({ date: '2026-02-10', category: IncomeCategories.CRYPTO, amount: 5000 }),
      income({ date: '2026-03-10', category: IncomeCategories.BANK_ACCOUNTS, amount: 1000 }),
    ];
    const expenses = [
      expense({ category: 'Groceries', datePosted: '2026-01-15', amount: 50 }),
      expense({ category: 'Groceries', datePosted: '2026-02-15', amount: 50 }),
      expense({ category: 'Groceries', datePosted: '2026-03-15', amount: 50 }),
    ];

    const result = buildSankeyData(incomeEntries, expenses);

    // Active month is March, compared against Feb. If CRYPTO had been
    // counted, Feb's total would be 6000 and savings would be 5000; since
    // it's excluded, both months total 1000 and savings is 0.
    expect(result.incomeAmount).toBe(50); // expenseTotal(50) + savings(0)
  });

  it('excludes the very first income month even if it has expenses', () => {
    const incomeEntries = [
      income({ date: '2026-01-10', amount: 1000 }),
      income({ date: '2026-02-10', amount: 1200 }),
    ];
    const expenses = [
      expense({ category: 'Groceries', datePosted: '2026-01-15', amount: 50 }),
      expense({ category: 'Groceries', datePosted: '2026-02-15', amount: 50 }),
    ];

    const result = buildSankeyData(incomeEntries, expenses);

    // Only one eligible month (Feb) remains once Jan is excluded, so there's
    // no previous month to compare against and the result stays "empty".
    expect(result.availableMonths).toEqual(['2026-02']);
    expect(result.nodes).toEqual([]);
  });

  it('excludes income months with no matching expenses', () => {
    const incomeEntries = [
      income({ date: '2026-01-10', amount: 1000 }),
      income({ date: '2026-02-10', amount: 1000 }), // no expenses this month
      income({ date: '2026-03-10', amount: 1200 }),
    ];
    const expenses = [
      expense({ category: 'Groceries', datePosted: '2026-01-15', amount: 50 }),
      expense({ category: 'Groceries', datePosted: '2026-03-15', amount: 50 }),
    ];

    const result = buildSankeyData(incomeEntries, expenses);

    // Jan excluded (first income month), Feb excluded (no expenses) -> only March remains.
    expect(result.availableMonths).toEqual(['2026-03']);
    expect(result.nodes).toEqual([]);
  });

  it('builds nodes/links comparing the active month against the previous eligible month', () => {
    const incomeEntries = [
      income({ date: '2026-01-10', amount: 1000 }),
      income({ date: '2026-02-10', amount: 1000 }),
      income({ date: '2026-03-10', amount: 1200 }),
    ];
    const expenses = [
      expense({ category: 'Groceries', datePosted: '2026-01-15', amount: 50 }),
      expense({ category: 'Groceries', datePosted: '2026-02-15', amount: 500 }),
      expense({ category: 'Rent', datePosted: '2026-03-15', amount: 500 }),
      expense({ category: 'Groceries', datePosted: '2026-03-15', amount: 300 }),
    ];

    const result = buildSankeyData(incomeEntries, expenses);

    // Feb and March are eligible (Jan excluded as the first income month).
    // Active = March (last), previous = Feb. savings = |1200 - 1000| = 200.
    expect(result.activeMonth).toBe('2026-03');
    expect(result.availableMonths).toEqual(['2026-02', '2026-03']);
    expect(result.expenseTotal).toBe(800); // 500 (Rent) + 300 (Groceries) in March
    expect(result.incomeAmount).toBe(1000); // expenseTotal(800) + savings(200)
    expect(result.monthLabel).toBe('March 2026');
    // All entries are BANK_ACCOUNTS, so the whole $200 swing is cash savings.
    expect(result.cashSavings).toBe(200);
    expect(result.investmentGrowth).toBe(0);

    expect(result.nodes.map((n) => n.name)).toEqual([
      'Income • $1,000',
      'Rent • $500',
      'Groceries • $300',
      'Savings • $200 (Cash $200 / Investments $0)',
    ]);
    expect(result.links).toEqual([
      { source: 0, target: 1, value: 500, color: result.nodes[1].color },
      { source: 0, target: 2, value: 300, color: result.nodes[2].color },
      { source: 0, target: 3, value: 200, color: '#22c55e' },
    ]);
  });

  it('omits the Savings node/link when income is unchanged month over month', () => {
    const incomeEntries = [
      income({ date: '2026-01-10', amount: 1000 }),
      income({ date: '2026-02-10', amount: 1000 }),
      income({ date: '2026-03-10', amount: 1000 }),
    ];
    const expenses = [
      expense({ category: 'Groceries', datePosted: '2026-01-15', amount: 50 }),
      expense({ category: 'Groceries', datePosted: '2026-02-15', amount: 50 }),
      expense({ category: 'Groceries', datePosted: '2026-03-15', amount: 400 }),
    ];

    const result = buildSankeyData(incomeEntries, expenses);

    expect(result.nodes.map((n) => n.name)).toEqual(['Income • $400', 'Groceries • $400']);
    expect(result.links).toHaveLength(1);
  });

  it('honors an explicit selectedMonth instead of defaulting to the latest', () => {
    const incomeEntries = [
      income({ date: '2026-01-10', amount: 1000 }),
      income({ date: '2026-02-10', amount: 1100 }),
      income({ date: '2026-03-10', amount: 1200 }),
    ];
    const expenses = [
      expense({ category: 'Groceries', datePosted: '2026-01-15', amount: 50 }),
      expense({ category: 'Groceries', datePosted: '2026-02-15', amount: 50 }),
      expense({ category: 'Groceries', datePosted: '2026-03-15', amount: 50 }),
    ];

    const result = buildSankeyData(incomeEntries, expenses, '2026-02');

    expect(result.activeMonth).toBe('2026-02');
    // Comparing Feb (1100) against the only earlier eligible month... there
    // isn't one before Feb in monthsWithExpenses (Jan was excluded as the
    // first income month), so this behaves like the "no previous month" case.
    expect(result.nodes).toEqual([]);
    expect(result.availableMonths).toEqual(['2026-02', '2026-03']);
  });

  it('attributes the savings swing to cash vs. investments separately', () => {
    const incomeEntries = [
      income({ date: '2026-01-10', category: IncomeCategories.BANK_ACCOUNTS, amount: 1000 }),
      income({ date: '2026-01-10', category: IncomeCategories.INVESTMENTS, amount: 500 }),
      income({ date: '2026-02-10', category: IncomeCategories.BANK_ACCOUNTS, amount: 1000 }),
      income({ date: '2026-02-10', category: IncomeCategories.INVESTMENTS, amount: 500 }),
      // March: bank/cash grows by 50 (contribution/spending), investments grow by 150 (market gain).
      income({ date: '2026-03-10', category: IncomeCategories.BANK_ACCOUNTS, amount: 1050 }),
      income({ date: '2026-03-10', category: IncomeCategories.INVESTMENTS, amount: 650 }),
    ];
    const expenses = [
      expense({ category: 'Groceries', datePosted: '2026-01-15', amount: 50 }),
      expense({ category: 'Groceries', datePosted: '2026-02-15', amount: 50 }),
      expense({ category: 'Groceries', datePosted: '2026-03-15', amount: 50 }),
    ];

    const result = buildSankeyData(incomeEntries, expenses);

    expect(result.cashSavings).toBe(50);
    expect(result.investmentGrowth).toBe(150);
    expect(result.nodes.map((n) => n.name)).toContain(
      'Savings • $200 (Cash $50 / Investments $150)',
    );
  });

  it('falls back to the latest month when selectedMonth is not an eligible month', () => {
    const incomeEntries = [
      income({ date: '2026-01-10', amount: 1000 }),
      income({ date: '2026-02-10', amount: 1000 }),
      income({ date: '2026-03-10', amount: 1200 }),
    ];
    const expenses = [
      expense({ category: 'Groceries', datePosted: '2026-01-15', amount: 50 }),
      expense({ category: 'Groceries', datePosted: '2026-02-15', amount: 50 }),
      expense({ category: 'Groceries', datePosted: '2026-03-15', amount: 50 }),
    ];

    const result = buildSankeyData(incomeEntries, expenses, '2099-12');

    expect(result.activeMonth).toBe('2026-03');
  });
});
