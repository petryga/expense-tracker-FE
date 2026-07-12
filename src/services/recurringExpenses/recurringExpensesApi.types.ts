import type { Currency } from '../../features/expenses/helpers';

export type RecurringExpenseData = {
  id?: string;
  account: string;
  description: string;
  category: string;
  currency: Currency | '';
  amount: number;
  dayOfMonth: number;
  isNew?: boolean;
};

export interface GetArgs {}

export interface PostArgs {
  data: RecurringExpenseData;
}

export interface PutArgs {
  id: string;
  data: RecurringExpenseData;
}

export interface DeleteRecurringExpenseArgs {
  id: string;
}
