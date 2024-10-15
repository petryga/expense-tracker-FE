import type { Currency } from '../../features/expenses/helpers';

export interface IncomeData {
  id?: string;
  isNew?: boolean;
  amount: number;
  date: string;
  description: string;
  category: string;
  currency: Currency | '';
}

export interface PostArgs {
  data: IncomeData | IncomeData[];
}

export interface PutArgs {
  id: string;
  data: IncomeData;
}

export interface GetArgs {}

export interface DeleteIncomeEntryArgs {
  id: string;
}
