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
): MonthlyExpense[] => {
  if (!expenses) return [];

  const aggregatedData = expenses.reduce(
    (acc: Record<string, MonthlyExpense>, expense: MonthlyData) => {
      const { yearMonth, amountCad, amountUsd, type: expenseType } = expense;
      const parsedAmountCad = parseFloat(amountCad).toFixed(2);
      const parsedAmountUsd = parseFloat(amountUsd).toFixed(2);

      if (expenseType === type && (parseFloat(amountCad) > 0 || parseFloat(amountUsd) > 0)) {
        if (!acc[yearMonth]) {
          acc[yearMonth] = { yearMonth, amountCad: '0', amountUsd: '0' };
        }

        acc[yearMonth].amountCad = (
          parseFloat(acc[yearMonth].amountCad) + parseFloat(parsedAmountCad)
        ).toFixed(2);
        acc[yearMonth].amountUsd = (
          parseFloat(acc[yearMonth].amountUsd) + parseFloat(parsedAmountUsd)
        ).toFixed(2);
      }
      return acc;
    },
    {}
  );

  return Object.values(aggregatedData).sort((a, b) => {
    const dateA = new Date(a.yearMonth + '-01');
    const dateB = new Date(b.yearMonth + '-01');
    return dateA.getTime() - dateB.getTime();
  });
};
