import type { Currency } from '../../features/expenses/helpers';

export type Data = {
  id?: string;
  datePosted: string;
  account: string;
  description: string;
  category: string;
  amount: number;
  isNew?: boolean;
  year?: number;
  month?: number;
  currency: Currency | '';
};

export interface GetExpensesData {
  data: Data[];
  expensesTotal: {
    totalAmountThisMonthCad: number;
    totalAmountThisMonthUsd: number;
    totalAmountAllTime: number;
    totalAmountSearchResultsCad?: number;
    totalAmountSearchResultsUsd?: number;
  };
}

export type NewDataResponse = {
  data: DataResponse[];
  expensesTotal: {
    totalAmountThisMonthCad: number;
    totalAmountThisMonthUsd: number;
    totalAmountAllTime: number;
    totalAmountSearchResultsCad?: number;
    totalAmountSearchResultsUsd?: number;
  };
};

export type DataResponse = {
  id?: string;
  datePosted: string;
  account: string;
  description: string;
  category: string;
  amount: string;
  year: number;
  month: number;
  currency: Currency | '';
};

export type GetArgs = {
  yearMonth?: string;
  search?: string;
};

export type PostArgs = {
  data: Data | Data[];
};

export type PatchArgs = {
  id: string;
  data: Data;
};

export type DeleteExpenseArgs = {
  id: string;
};

export type DeleteExpensesArgs = {
  ids: string[];
};
