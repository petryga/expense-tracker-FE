import type {
  MonthlyData,
  MonthlyDataTypes,
} from '../../../services/monthlyData/monthlyData.types';

interface MonthlyExpense {
  yearMonth: string;
  amountCad: string;
  amountUsd: string;
}

export const groupMonthlyData = (
  type: MonthlyDataTypes,
  expenses?: MonthlyData[]
): Record<string, MonthlyExpense> => {
  if (!expenses) return {};

  const currentYear = new Date().getFullYear();

  return expenses.reduce((acc: Record<string, MonthlyExpense>, expense: MonthlyData) => {
    const { yearMonth, amountCad, amountUsd, type: expenseType } = expense;
    const year = parseInt(yearMonth.split('-')[0]);

    const parsedAmountCad = parseFloat(amountCad).toFixed(2);
    const parsedAmountUsd = parseFloat(amountUsd).toFixed(2);

    if (
      year === currentYear &&
      expenseType === type &&
      (parseFloat(amountCad) > 0 || parseFloat(amountUsd) > 0)
    ) {
      if (!acc[yearMonth]) {
        acc[yearMonth] = { yearMonth, amountCad: '', amountUsd: '' };
      }
      acc[yearMonth].amountCad += parsedAmountCad;
      acc[yearMonth].amountUsd += parsedAmountUsd;
    }

    return acc;
  }, {});
};
