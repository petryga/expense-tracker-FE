import type { Currency } from '../../features/expenses/helpers';

export type RecurringIncomeData = {
  id?: string;
  description: string;
  category: string;
  currency: Currency | '';
  amount: number;
  isNew?: boolean;
};

export interface GetArgs {}

export interface PostArgs {
  data: RecurringIncomeData;
}

export interface PutArgs {
  id: string;
  data: RecurringIncomeData;
}

export interface DeleteRecurringIncomeArgs {
  id: string;
}
