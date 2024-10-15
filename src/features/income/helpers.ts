import { Currency } from '../expenses/helpers';
import type { RecurringIncomeEntries } from './IncomePage.types';

export enum IncomeCategories {
  BANK_ACCOUNTS = 'bankAccounts',
  CRYPTO = 'crypto',
  INVESTMENTS = 'investments',
  CASH = 'cash',
}

export const getRecurringIncomeEntries = (): RecurringIncomeEntries[] => {
  return [
    {
      category: IncomeCategories.BANK_ACCOUNTS,
      amount: 0,
      description: '',
      date: '',
      currency: '',
    },
    {
      category: IncomeCategories.CRYPTO,
      amount: 0,
      description: '',
      date: '',
      currency: '',
    },
    {
      category: IncomeCategories.INVESTMENTS,
      amount: 0,
      description: '',
      date: '',
      currency: '',
    },
    {
      category: IncomeCategories.CASH,
      amount: 0,
      description: '',
      date: '',
      currency: Currency.CAD,
    },
    {
      category: IncomeCategories.CASH,
      amount: 0,
      description: '',
      date: '',
      currency: Currency.USD,
    },
  ];
};
