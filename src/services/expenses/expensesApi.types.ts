import type { Currency } from '../../features/expenses/helpers';

export type Data = {
  id?: string;
  datePosted: string;
  account: string;
  description: string;
  // Categories are user-editable (see services/categories), not a fixed set.
  category: string;
  amount: number;
  isNew?: boolean;
  year?: number;
  month?: number;
  currency: Currency | '';
  // Bought as a gift: keeps its real category, counts under Gifts in reports.
  isGift?: boolean;
  // Where it was bought, when the description doesn't say ("Amazon" for the
  // items of a split Amazon order, or a marketplace from Settings). Set by the
  // backend; read-only here.
  merchant?: string | null;
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
  isGift?: boolean;
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
