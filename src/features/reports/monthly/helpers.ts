import type { MonthlyReport } from '../../../services/monthlyData/monthlyData.types';
import { DataByCategory } from '../../expenses/ExpensesPage.types';

const colors = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
  '#8dd1e1',
  '#a4de6c',
  '#d0ed57',
  '#ffc0cb',
  '#b0e0e6',
  '#ffb6c1',
  '#db7093',
];

const getColor = (index: number) => {
  return colors[index % colors.length];
};

// The BE does the grouping and totals; this only adds what is purely visual
// (a colour per bar) and joins in each category's budget.
export const decorateReport = (
  report?: MonthlyReport,
  budgetsByCategory: Record<string, number | null> = {},
): { dataByCategory: DataByCategory[]; totalSpentCad: number; totalSpentUsd: number } => {
  if (!report) {
    return { dataByCategory: [], totalSpentCad: 0, totalSpentUsd: 0 };
  }

  return {
    dataByCategory: report.dataByCategory.map((entry, index) => ({
      ...entry,
      fill: getColor(index),
      budget: budgetsByCategory[entry.category] ?? null,
    })),
    totalSpentCad: report.totalSpentCad,
    totalSpentUsd: report.totalSpentUsd,
  };
};
