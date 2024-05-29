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
};

export interface GetExpensesData {
  data: Data[];
  expensesTotal: {
    totalAmountThisMonth: number;
    totalAmountAllTime: number;
    totalAmountSearchResults?: number;
  };
}

export type NewDataResponse = {
  data: DataResponse[];
  expensesTotal: {
    totalAmountThisMonth: number;
    totalAmountAllTime: number;
    totalAmountSearchResults?: number;
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
