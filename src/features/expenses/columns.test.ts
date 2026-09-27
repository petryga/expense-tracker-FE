import { describe, expect, it, vi } from 'vitest';
import { createTableColumns } from './columns';
import { Currency } from './helpers';
import type { Data } from '../../services/expenses/expensesApi.types';

// createTableColumns returns a bare GridColDef[], which widens each column's
// valueGetter/valueSetter to MUI's defaults (value: never for valueGetter).
// The datePosted getter/setter under test never inspect column/apiRef, only
// value/row, so cast once to a signature matching the real implementation in
// columns.tsx rather than fighting MUI's generic defaults.
type DatePostedValueGetter = (
  value: Date | string | null,
  row: Data,
  column: unknown,
  apiRef: unknown,
) => Date | string | null;
type DatePostedValueSetter = (
  value: Date | null,
  row: Data,
  column: unknown,
  apiRef: unknown,
) => Data;

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
  return {
    valueGetter: column.valueGetter as unknown as DatePostedValueGetter,
    valueSetter: column.valueSetter as unknown as DatePostedValueSetter,
  };
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
    const { valueGetter } = getDatePostedColumn();
    const result = valueGetter('2026-07-13', makeRow(), undefined, undefined);

    expect(result).toBeInstanceOf(Date);
    expect((result as Date).getFullYear()).toBe(2026);
    expect((result as Date).getMonth()).toBe(6);
    expect((result as Date).getDate()).toBe(13);
  });

  it('parses a full ISO timestamp string without producing an Invalid Date', () => {
    const { valueGetter } = getDatePostedColumn();
    const result = valueGetter(
      '2026-06-30T07:00:00.000Z',
      makeRow({ datePosted: '2026-06-30T07:00:00.000Z' }),
      undefined,
      undefined,
    );

    expect(result).toBeInstanceOf(Date);
    expect(Number.isNaN((result as Date).getTime())).toBe(false);
    expect((result as Date).getFullYear()).toBe(2026);
    expect((result as Date).getMonth()).toBe(5);
    expect((result as Date).getDate()).toBe(30);
  });

  it('passes through an existing Date instance unchanged', () => {
    const { valueGetter } = getDatePostedColumn();
    const date = new Date(2026, 6, 13);
    const result = valueGetter(date, makeRow(), undefined, undefined);

    expect(result).toBe(date);
  });

  it('passes through a falsy value unchanged', () => {
    const { valueGetter } = getDatePostedColumn();
    expect(valueGetter('', makeRow(), undefined, undefined)).toBe('');
    expect(valueGetter(null, makeRow(), undefined, undefined)).toBe(null);
  });
});

describe('datePosted column valueSetter', () => {
  it('converts an edited local Date back into a yyyy-MM-dd string', () => {
    const { valueSetter } = getDatePostedColumn();
    const row = makeRow();
    const date = new Date(2026, 6, 13);

    const result = valueSetter(date, row, undefined, undefined);

    expect(result.datePosted).toBe('2026-07-13');
  });

  it('pads single-digit month and day', () => {
    const { valueSetter } = getDatePostedColumn();
    const row = makeRow();
    const date = new Date(2026, 0, 5);

    const result = valueSetter(date, row, undefined, undefined);

    expect(result.datePosted).toBe('2026-01-05');
  });

  describe('when the edited value is null (e.g. an incomplete segmented date entry)', () => {
    it('falls back to the last day of September (30) instead of crashing on day 31', () => {
      const { valueSetter } = getDatePostedColumn();
      const row = makeRow({ datePosted: '2026-09-15' });

      const result = valueSetter(null, row, undefined, undefined);

      expect(result.datePosted).toBe('2026-09-30');
    });

    it('falls back to the last day of November (30) instead of crashing on day 31', () => {
      const { valueSetter } = getDatePostedColumn();
      const row = makeRow({ datePosted: '2026-11-01' });

      const result = valueSetter(null, row, undefined, undefined);

      expect(result.datePosted).toBe('2026-11-30');
    });

    it('falls back to the last day of February in a non-leap year (28)', () => {
      const { valueSetter } = getDatePostedColumn();
      const row = makeRow({ datePosted: '2026-02-10' });

      const result = valueSetter(null, row, undefined, undefined);

      expect(result.datePosted).toBe('2026-02-28');
    });

    it('falls back to the last day of February in a leap year (29)', () => {
      const { valueSetter } = getDatePostedColumn();
      const row = makeRow({ datePosted: '2028-02-10' });

      const result = valueSetter(null, row, undefined, undefined);

      expect(result.datePosted).toBe('2028-02-29');
    });

    it('is unaffected by months that already have 31 days', () => {
      const { valueSetter } = getDatePostedColumn();
      const row = makeRow({ datePosted: '2026-07-13' });

      const result = valueSetter(null, row, undefined, undefined);

      expect(result.datePosted).toBe('2026-07-31');
    });

    it('handles a full ISO timestamp string as the existing row value', () => {
      const { valueSetter } = getDatePostedColumn();
      const row = makeRow({ datePosted: '2026-09-15T07:00:00.000Z' });

      const result = valueSetter(null, row, undefined, undefined);

      expect(result.datePosted).toBe('2026-09-30');
    });

    it('falls back to the current month when the row has no existing datePosted', () => {
      const { valueSetter } = getDatePostedColumn();
      const row = makeRow({ datePosted: '' });
      const now = new Date();
      const expectedLastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

      const result = valueSetter(null, row, undefined, undefined);

      expect(result.datePosted).toBe(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(expectedLastDay).padStart(2, '0')}`,
      );
    });
  });
});
