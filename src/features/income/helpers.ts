import type { RecurringIncomeEntries } from './IncomePage.types';

export enum IncomeCategories {
  BANK_ACCOUNTS = 'bankAccounts',
  CRYPTO = 'crypto',
  INVESTMENTS = 'investments',
  CASH = 'cash',
}

const CATEGORIES = [
  IncomeCategories.BANK_ACCOUNTS,
  IncomeCategories.CRYPTO,
  IncomeCategories.INVESTMENTS,
  IncomeCategories.CASH,
];

export const getRecurringIncomeEntries = (): RecurringIncomeEntries[] =>
  CATEGORIES.map((category) => ({
    category,
    amount: 0,
    description: '',
    date: '',
  }));
