import { describe, expect, it } from 'vitest';
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
    const result = getRowClassName({ id: 'a', row: rows[0] } as any, rows);
    expect(result).toBe('');
  });

  it('returns empty when the previous row is in the same month', () => {
    const result = getRowClassName({ id: 'b', row: rows[1] } as any, rows);
    expect(result).toBe('');
  });

  it('flags "new-month-row" for a first-of-the-month date without rolling back to the previous month locally', () => {
    const result = getRowClassName({ id: 'c', row: rows[2] } as any, rows);
    expect(result).toBe('new-month-row');
  });
});
