import { Data } from '../../../services/expenses/expensesApi.types';
import { DataByCategory } from '../../expenses/ExpensesPage.types';

const getColor = (index: number) => {
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
    '#ff69b4',
    '#db7093',
    '#c71585',
  ];
  return colors[index % colors.length];
};

export const getVisualizedData = (
  data?: Data[]
): { dataByCategory: DataByCategory[]; totalSpent: number } => {
  if (!data) {
    return { dataByCategory: [], totalSpent: 0 };
  }

  const sumByCategory: Record<string, DataByCategory> = {};

  let total = 0;

  const filteredData = data.filter((entry) => entry.category !== 'Rent' && entry.amount > 0);

  filteredData.forEach((entry) => {
    const { category, description, amount } = entry;
    if (!sumByCategory[category]) {
      sumByCategory[category] = {
        category,
        total: 0,
        details: [],
        fill: getColor(Object.keys(sumByCategory).length),
      };
    }
    sumByCategory[category].total += amount;
    sumByCategory[category].details.push({ description, amount });

    total += amount;
  });

  for (const cat in sumByCategory) {
    sumByCategory[cat].details.sort((a, b) => b.amount - a.amount);
  }

  const sortedByAmount = Object.values(sumByCategory).sort((a, b) => b.total - a.total);

  return {
    dataByCategory: Object.values(sortedByAmount),
    totalSpent: parseFloat(total.toFixed(2)),
  };
};
