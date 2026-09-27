import { describe, expect, it, vi } from 'vitest';
import { createTableColumns } from './columns';
import { Currency } from '../expenses/helpers';
import type { IncomeData } from '../../services/income/incomeApi.types';

// createTableColumns returns a bare GridColDef[], which widens each column's
// valueGetter/valueSetter to MUI's defaults. The date getter/setter under
// test never inspect column/apiRef, only value/row, so cast once to a
// signature matching the real implementation in columns.tsx rather than
// fighting MUI's generic defaults.
type DateValueGetter = (
  value: Date | string | null,
  row: IncomeData,
  column: unknown,
  apiRef: unknown,
) => Date | string | null;
type DateValueSetter = (
  value: Date | null,
  row: IncomeData,
  column: unknown,
  apiRef: unknown,
) => IncomeData;

const getDateColumn = () => {
  const columns = createTableColumns({
    rowModesModel: {},
    setRowModesModel: vi.fn(),
    rows: [],
    setRows: vi.fn(),
    handleOpenModal: () => () => {},
    handleCheckboxChange: vi.fn(),
    handleHeaderCheckboxChange: vi.fn(),
    selectedRows: [],
  });

  const column = columns.find((col) => col.field === 'date' && col.editable);
  if (!column) throw new Error('Editable date column not found');
  return {
    valueGetter: column.valueGetter as unknown as DateValueGetter,
    valueSetter: column.valueSetter as unknown as DateValueSetter,
  };
};

const makeRow = (overrides: Partial<IncomeData> = {}): IncomeData => ({
  date: '2026-07-13',
  amount: 10,
  description: 'Test',
  category: 'Bank Accounts',
  currency: Currency.USD,
  ...overrides,
});

describe('date column valueGetter', () => {
  it('parses a plain yyyy-MM-dd string into a local Date on the correct day', () => {
    const { valueGetter } = getDateColumn();
    const result = valueGetter('2026-07-13', makeRow(), undefined, undefined);

    expect(result).toBeInstanceOf(Date);
    expect((result as Date).getFullYear()).toBe(2026);
    expect((result as Date).getMonth()).toBe(6);
    expect((result as Date).getDate()).toBe(13);
  });

  it('passes through a falsy value unchanged', () => {
    const { valueGetter } = getDateColumn();
    expect(valueGetter('', makeRow(), undefined, undefined)).toBe('');
    expect(valueGetter(null, makeRow(), undefined, undefined)).toBe(null);
  });
});

describe('date column valueSetter', () => {
  it('converts an edited local Date back into a yyyy-MM-dd string', () => {
    const { valueSetter } = getDateColumn();
    const row = makeRow();
    const date = new Date(2026, 6, 13);

    const result = valueSetter(date, row, undefined, undefined);

    expect(result.date).toBe('2026-07-13');
  });

  it('pads single-digit month and day', () => {
    const { valueSetter } = getDateColumn();
    const row = makeRow();
    const date = new Date(2026, 0, 5);

    const result = valueSetter(date, row, undefined, undefined);

    expect(result.date).toBe('2026-01-05');
  });

  describe('when the edited value is null (e.g. an incomplete segmented date entry)', () => {
    it('falls back to the last day of September (30) instead of silently nulling the date', () => {
      const { valueSetter } = getDateColumn();
      const row = makeRow({ date: '2026-09-15' });

      const result = valueSetter(null, row, undefined, undefined);

      expect(result.date).toBe('2026-09-30');
    });

    it('falls back to the last day of November (30)', () => {
      const { valueSetter } = getDateColumn();
      const row = makeRow({ date: '2026-11-01' });

      const result = valueSetter(null, row, undefined, undefined);

      expect(result.date).toBe('2026-11-30');
    });

    it('falls back to the last day of February in a non-leap year (28)', () => {
      const { valueSetter } = getDateColumn();
      const row = makeRow({ date: '2026-02-10' });

      const result = valueSetter(null, row, undefined, undefined);

      expect(result.date).toBe('2026-02-28');
    });

    it('falls back to the last day of February in a leap year (29)', () => {
      const { valueSetter } = getDateColumn();
      const row = makeRow({ date: '2028-02-10' });

      const result = valueSetter(null, row, undefined, undefined);

      expect(result.date).toBe('2028-02-29');
    });

    it('is unaffected by months that already have 31 days', () => {
      const { valueSetter } = getDateColumn();
      const row = makeRow({ date: '2026-07-13' });

      const result = valueSetter(null, row, undefined, undefined);

      expect(result.date).toBe('2026-07-31');
    });

    it('falls back to the current month when the row has no existing date', () => {
      const { valueSetter } = getDateColumn();
      const row = makeRow({ date: '' });
      const now = new Date();
      const expectedLastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

      const result = valueSetter(null, row, undefined, undefined);

      expect(result.date).toBe(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(expectedLastDay).padStart(2, '0')}`,
      );
    });
  });
});
