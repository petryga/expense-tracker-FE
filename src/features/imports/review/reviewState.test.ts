import { describe, expect, it } from 'vitest';
import type { ImportItem, ImportRow } from '../../../services/imports/importsApi.types';
import {
  actionsFor,
  buildDecisions,
  defaultChoice,
  formatCents,
  pendingCount,
  suggestionNote,
} from './reviewState';

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
  suggestedCategory: null,
  suggestionSource: null,
  suggestionStatus: 'none',
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
      a: { action: 'save', category: 'Groceries', description: '  ', isGift: false },
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

describe('suggestions', () => {
  it('pre-fill the category, but a category already chosen wins', () => {
    expect(defaultChoice(row({ suggestedCategory: 'Groceries' })).category).toBe('Groceries');
    expect(
      defaultChoice(row({ suggestedCategory: 'Groceries', category: 'Eating Out' })).category,
    ).toBe('Eating Out');
  });

  it('are labelled by where they came from, until you change them', () => {
    const fromMemory = row({ suggestedCategory: 'Groceries', suggestionSource: 'memory' });
    const fromAi = row({ suggestedCategory: 'Groceries', suggestionSource: 'model' });
    expect(suggestionNote(fromMemory, 'Groceries')).toBe('Suggested: you chose this before');
    expect(suggestionNote(fromAi, 'Groceries')).toBe('Suggested by AI');
    expect(suggestionNote(fromAi, 'Eating Out')).toBeNull();
    expect(suggestionNote(row({ suggestionStatus: 'pending' }), '')).toBe('Getting a suggestion…');
  });

  it('count only draft rows still waiting for the AI', () => {
    expect(
      pendingCount([
        row({ id: 'a', suggestionStatus: 'pending' }),
        row({ id: 'b', suggestionStatus: 'pending', status: 'saved' }),
        row({ id: 'c', suggestionStatus: 'done' }),
      ]),
    ).toBe(1);
  });

  it('are confirmed like any chosen category', () => {
    const decisions = buildDecisions([row({ id: 's', suggestedCategory: 'Groceries' })], {});
    expect(decisions).toEqual([
      { id: 's', action: 'save', category: 'Groceries', description: 'whole foods mkt' },
    ]);
  });
});

it('sends the gift flag only for rows ticked as gifts', () => {
  const decisions = buildDecisions([row({ id: 'g' }), row({ id: 'n' })], {
    g: { action: 'save', category: 'Clothing', description: 'scarf', isGift: true },
    n: { action: 'save', category: 'Clothing', description: 'jeans', isGift: false },
  });
  expect(decisions).toEqual([
    { id: 'g', action: 'save', category: 'Clothing', description: 'scarf', isGift: true },
    { id: 'n', action: 'save', category: 'Clothing', description: 'jeans' },
  ]);
});

describe('split Amazon charges', () => {
  const item = (id: string, overrides: Partial<ImportItem> = {}): ImportItem => ({
    id,
    description: `Test product ${id} with a long name`,
    suggestedDescription: `Test product ${id}`,
    amountCents: 500,
    quantity: 1,
    category: null,
    expenseId: null,
    suggestedCategory: null,
    suggestionSource: null,
    suggestionStatus: 'none',
    ...overrides,
  });
  const split = row({
    id: 'amz',
    description: 'AMAZON MKTPL*TEST0001',
    amountCents: 1000,
    amazonStatus: 'matched',
    items: [item('i1', { suggestedCategory: 'Garden' }), item('i2')],
  });

  it('waits until every item has a category, then saves them together', () => {
    expect(buildDecisions([split], {})).toEqual([]);
    const choices = {
      i2: { action: 'save' as const, category: 'Books', description: 'A book', isGift: true },
    };
    expect(buildDecisions([split], choices)).toEqual([
      {
        id: 'amz',
        action: 'save',
        items: [
          { id: 'i1', category: 'Garden', description: 'Test product i1' },
          { id: 'i2', category: 'Books', description: 'A book', isGift: true },
        ],
      },
    ]);
  });

  it('skips the whole charge, and counts pending item suggestions', () => {
    const choices = {
      amz: { action: 'skip' as const, category: '', description: '', isGift: false },
    };
    expect(buildDecisions([split], choices)).toEqual([{ id: 'amz', action: 'skip' }]);
    const pending = { ...split, items: [item('i1', { suggestionStatus: 'pending' })] };
    expect(pendingCount([pending])).toBe(1);
  });

  it('treats a charge kept whole as an ordinary row', () => {
    const whole = { ...split, amazonStatus: 'declined' as const, items: [] };
    const choices = {
      amz: { action: 'save' as const, category: 'Shopping', description: 'amazon', isGift: false },
    };
    expect(buildDecisions([whole], choices)).toEqual([
      { id: 'amz', action: 'save', category: 'Shopping', description: 'amazon' },
    ]);
  });

  it('leaves refunded items out, and returns a saved item from its refund', () => {
    const withReturn = {
      ...split,
      items: [item('i1', { suggestedCategory: 'Garden' }), item('i2', { status: 'returned' })],
    };
    expect(buildDecisions([withReturn], {})).toEqual([
      {
        id: 'amz',
        action: 'save',
        items: [{ id: 'i1', category: 'Garden', description: 'Test product i1' }],
      },
    ]);
    const refund = row({
      id: 'ref',
      kind: 'refund',
      amountCents: -500,
      matchedItem: {
        id: 'i2',
        description: 'Test product',
        amountCents: 500,
        expenseId: 'e9',
        chargePostedDate: '2026-03-04',
      },
    });
    expect(defaultChoice(refund).action).toBe('return');
    expect(actionsFor(refund)).toEqual(['return', 'skip']);
  });
});
