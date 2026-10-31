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
  category?: string;
  currency?: string;
}

export type PostArgs = {
  data: MonthlyData;
};

export type YearlyComparisonMode = 'ytd' | 'full-year';

export interface YearlyComparisonRow {
  year: number;
  amountCad: number;
  amountUsd: number;
  convertedTotal: number;
  monthsCount: number;
  cutoffMonth: number | null;
  annualized: number;
  isIncomplete: boolean;
}

export interface YearlyComparisonResult {
  rows: YearlyComparisonRow[];
  ytdCutoffOptionsByYear: Record<number, number[]>;
  defaultYtdCutoffByYear: Record<number, number>;
}

export interface YearlyComparisonArgs {
  mode: YearlyComparisonMode;
  baseCurrency: string;
  // year -> cutoff month; null leaves that year out of a YTD comparison.
  cutoffs?: Partial<Record<number, number | null>>;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  details: { description: string; amount: number; currency: string }[];
}

export interface MonthlyReport {
  yearMonth: string;
  dataByCategory: CategoryBreakdown[];
  totalSpentCad: number;
  totalSpentUsd: number;
}

// All amounts in USD; incomeAmount is expenses plus savings.
export interface FlowReport {
  availableMonths: string[];
  activeMonth: string | null;
  incomeAmount: number;
  expenseTotal: number;
  savings: number;
  cashSavings: number;
  investmentGrowth: number;
  categories: { category: string; value: number }[];
}
