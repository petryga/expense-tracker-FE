import type {
  MonthlyData,
  MonthlyDataTypes,
} from '../../../services/monthlyData/monthlyData.types';

interface MonthlyExpense {
  yearMonth: string;
  amount: string;
}

export const groupMonthlyData = (
  type: MonthlyDataTypes,
  expenses?: MonthlyData[]
): Record<string, MonthlyExpense> => {
  if (!expenses) return {};

  const currentYear = new Date().getFullYear();

  return expenses.reduce((acc: Record<string, MonthlyExpense>, expense: MonthlyData) => {
    const { yearMonth, amount, type: expenseType } = expense;
    const year = parseInt(yearMonth.split('-')[0]);

    const parsedAmount = parseFloat(amount).toFixed(2);

    if (year === currentYear && expenseType === type && parseFloat(amount) > 0) {
      if (!acc[yearMonth]) {
        acc[yearMonth] = { yearMonth, amount: '' };
      }
      acc[yearMonth].amount += parsedAmount;
    }

    return acc;
  }, {});
};
