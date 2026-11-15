import { describe, expect, it } from 'vitest';
import type { ImportRow } from '../../../services/imports/importsApi.types';
import { actionsFor, buildDecisions, defaultChoice, formatCents } from './reviewState';

const row = (overrides: Partial<ImportRow>): ImportRow => ({
  id: 'r1',
  postedDate: '2026-10-01',
  description: 'WHOLE FOODS MKT',
  suggestedDescription: 'whole foods mkt',
  amountCents: 1000,
  kind: 'charge',
  status: 'draft',
  category: null,
  expenseId: null,
  amexCategory: null,
  matched: null,
  ...overrides,
});

const matched = {
  id: 'c1',
  batchId: 'b0',
  postedDate: '2026-09-01',
  description: 'AMAZON',
  amountCents: 2499,
  status: 'saved' as const,
  expenseId: 'e1',
};

describe('defaultChoice / actionsFor', () => {
  it('saves charges, skips unmatched refunds, returns refunds of saved purchases', () => {
    expect(defaultChoice(row({})).action).toBe('save');
    expect(defaultChoice(row({ kind: 'refund', amountCents: -500 })).action).toBe('skip');
    expect(defaultChoice(row({ kind: 'refund', amountCents: -2499, matched })).action).toBe(
      'return',
    );
    expect(actionsFor(row({ kind: 'refund', matched }))).toEqual(['return', 'skip']);
    expect(actionsFor(row({}))).toEqual(['save', 'skip']);
  });
});

describe('buildDecisions', () => {
  it('sends skips and returns, and only the saves that have a category', () => {
    const rows = [
      row({ id: 'a' }),
      row({ id: 'b' }),
      row({ id: 'c', kind: 'refund', amountCents: -2499, matched }),
      row({ id: 'd', kind: 'refund', amountCents: -500 }),
      row({ id: 'e', status: 'saved' }),
    ];
    const decisions = buildDecisions(rows, {
      a: { action: 'save', category: 'Groceries', description: '  ' },
    });
    expect(decisions).toEqual([
      { id: 'a', action: 'save', category: 'Groceries', description: 'whole foods mkt' },
      { id: 'c', action: 'return' },
      { id: 'd', action: 'skip' },
    ]);
  });
});

it('formats cents as money', () => {
  expect(formatCents(-2499)).toBe('-$24.99');
  expect(formatCents(120410)).toBe('$1,204.10');
});
