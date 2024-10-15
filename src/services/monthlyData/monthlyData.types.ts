export enum MonthlyDataTypes {
  Expense = 'expense',
  Income = 'income',
}

export interface MonthlyData {
  id: string;
  yearMonth: string;
  type: MonthlyDataTypes;
  amountCad: string;
  amountUsd: string;
  isNew?: boolean;
}

export interface PatchArgs {
  id: string;
  data: MonthlyData;
}

export interface GetArgs {
  type?: MonthlyDataTypes;
}

export type DeleteArgs = {
  id: string;
};

export type PostArgs = {
  data: MonthlyData;
};
