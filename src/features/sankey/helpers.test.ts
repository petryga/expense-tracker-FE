import { describe, expect, it } from 'vitest';
import {
  buildSankeyData,
  formatSignedAmount,
  sortSavingsLast,
  splitTrailingParenthetical,
} from './helpers';
import type { FlowReport } from '../../services/monthlyData/monthlyData.types';

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

const report = (overrides: Partial<FlowReport> = {}): FlowReport => ({
  availableMonths: ['2026-02', '2026-03'],
  activeMonth: '2026-03',
  incomeAmount: 1000,
  expenseTotal: 800,
  savings: 200,
  cashSavings: 200,
  investmentGrowth: 0,
  categories: [
    { category: 'Rent', value: 500 },
    { category: 'Groceries', value: 300 },
  ],
  ...overrides,
});

describe('buildSankeyData', () => {
  it('returns an empty result with no report', () => {
    expect(buildSankeyData(undefined)).toMatchObject({
      nodes: [],
      links: [],
      availableMonths: [],
      activeMonth: undefined,
      incomeAmount: 0,
      expenseTotal: 0,
    });
  });

  it('builds income, category and savings nodes with matching links', () => {
    const result = buildSankeyData(report());

    expect(result.activeMonth).toBe('2026-03');
    expect(result.availableMonths).toEqual(['2026-02', '2026-03']);
    expect(result.monthLabel).toBe('March 2026');
    expect(result.expenseTotal).toBe(800);
    expect(result.incomeAmount).toBe(1000);
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

  it('omits the Savings node and link when there are no savings', () => {
    const result = buildSankeyData(report({ savings: 0, incomeAmount: 800, cashSavings: 0 }));

    expect(result.nodes.map((n) => n.name)).toEqual([
      'Income • $800',
      'Rent • $500',
      'Groceries • $300',
    ]);
    expect(result.links).toHaveLength(2);
  });

  it('shows signed cash and investment parts in the Savings label', () => {
    const result = buildSankeyData(report({ cashSavings: 300, investmentGrowth: -100 }));

    expect(result.nodes[result.nodes.length - 1].name).toBe(
      'Savings • $200 (Cash $300 / Investments -$100)',
    );
  });

  it('keeps the month list but draws nothing when the BE has no comparison to make', () => {
    const result = buildSankeyData(
      report({ incomeAmount: 0, expenseTotal: 0, savings: 0, categories: [] }),
    );

    expect(result.nodes).toEqual([]);
    expect(result.links).toEqual([]);
    expect(result.availableMonths).toEqual(['2026-02', '2026-03']);
    expect(result.activeMonth).toBe('2026-03');
  });
});
