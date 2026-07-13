import { describe, expect, it, vi } from 'vitest';
import { createTableColumns } from './columns';
import { Currency } from './helpers';
import type { Data } from '../../services/expenses/expensesApi.types';

const getDatePostedColumn = () => {
  const columns = createTableColumns({
    rowModesModel: {},
    setRowModesModel: vi.fn(),
    rows: [],
    setRows: vi.fn(),
    handleOpenModal: () => () => {},
    handleCheckboxChange: vi.fn(),
    handleHeaderCheckboxChange: vi.fn(),
    selectedRows: [],
    categories: [],
    budgetByCategory: {},
    accounts: [],
  });

  const column = columns.find((col) => col.field === 'datePosted' && col.editable);
  if (!column) throw new Error('Editable datePosted column not found');
  return column;
};

const makeRow = (overrides: Partial<Data> = {}): Data => ({
  datePosted: '2026-07-13',
  account: 'Amex',
  description: 'Test',
  category: 'Groceries',
  amount: 10,
  currency: Currency.USD,
  ...overrides,
});

describe('datePosted column valueGetter', () => {
  it('parses a plain yyyy-MM-dd string into a local Date on the correct day', () => {
    const column = getDatePostedColumn();
    const result = column.valueGetter!({ value: '2026-07-13', row: makeRow() } as any);

    expect(result).toBeInstanceOf(Date);
    expect((result as Date).getFullYear()).toBe(2026);
    expect((result as Date).getMonth()).toBe(6);
    expect((result as Date).getDate()).toBe(13);
  });

  it('parses a full ISO timestamp string without producing an Invalid Date', () => {
    const column = getDatePostedColumn();
    const result = column.valueGetter!({
      value: '2026-06-30T07:00:00.000Z',
      row: makeRow({ datePosted: '2026-06-30T07:00:00.000Z' }),
    } as any);

    expect(result).toBeInstanceOf(Date);
    expect(Number.isNaN((result as Date).getTime())).toBe(false);
    expect((result as Date).getFullYear()).toBe(2026);
    expect((result as Date).getMonth()).toBe(5);
    expect((result as Date).getDate()).toBe(30);
  });

  it('passes through an existing Date instance unchanged', () => {
    const column = getDatePostedColumn();
    const date = new Date(2026, 6, 13);
    const result = column.valueGetter!({ value: date, row: makeRow() } as any);

    expect(result).toBe(date);
  });

  it('passes through a falsy value unchanged', () => {
    const column = getDatePostedColumn();
    expect(column.valueGetter!({ value: '', row: makeRow() } as any)).toBe('');
    expect(column.valueGetter!({ value: null, row: makeRow() } as any)).toBe(null);
  });
});

describe('datePosted column valueSetter', () => {
  it('converts an edited local Date back into a yyyy-MM-dd string', () => {
    const column = getDatePostedColumn();
    const row = makeRow();
    const date = new Date(2026, 6, 13);

    const result = column.valueSetter!({ value: date, row } as any);

    expect(result.datePosted).toBe('2026-07-13');
  });

  it('pads single-digit month and day', () => {
    const column = getDatePostedColumn();
    const row = makeRow();
    const date = new Date(2026, 0, 5);

    const result = column.valueSetter!({ value: date, row } as any);

    expect(result.datePosted).toBe('2026-01-05');
  });
});
