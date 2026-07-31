import { describe, expect, it } from 'vitest';
import type { GridRowClassNameParams } from '@mui/x-data-grid';
import { getRowClassName } from './helpers';
import type { IncomeData } from '../../services/income/incomeApi.types';
import { Currency } from '../expenses/helpers';

const rows: IncomeData[] = [
  { id: 'a', date: '2026-05-15', description: '', category: 'bankAccounts', amount: 100, currency: Currency.CAD },
  { id: 'b', date: '2026-05-20', description: '', category: 'bankAccounts', amount: 200, currency: Currency.CAD },
  { id: 'c', date: '2026-07-01', description: '', category: 'bankAccounts', amount: 300, currency: Currency.CAD },
];

describe('getRowClassName', () => {
  it('returns empty for the first row (no previous row to compare against)', () => {
    const params = { id: 'a', row: rows[0] } as unknown as GridRowClassNameParams<IncomeData>;
    expect(getRowClassName(params, rows)).toBe('');
  });

  it('returns empty when the previous row is in the same month', () => {
    const params = { id: 'b', row: rows[1] } as unknown as GridRowClassNameParams<IncomeData>;
    expect(getRowClassName(params, rows)).toBe('');
  });

  it('flags "new-month-row" for a first-of-the-month date without rolling back to the previous month locally', () => {
    const params = { id: 'c', row: rows[2] } as unknown as GridRowClassNameParams<IncomeData>;
    expect(getRowClassName(params, rows)).toBe('new-month-row');
  });
});
