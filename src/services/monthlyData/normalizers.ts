import { MonthlyData, MonthlyDataTypes } from './monthlyData.types';

export const normalizeGetMonthlyData = (data: MonthlyData[], type?: string) => {
  if (!data) return [];

  let dataCopy = [...data];

  if (type === MonthlyDataTypes.Income) {
    dataCopy = dataCopy.filter((item) => item.type == MonthlyDataTypes.Income);
  }

  return dataCopy.map((item) => ({
    id: item.id,
    yearMonth: item.yearMonth,
    type: item.type,
    amountCad: item.amountCad,
    amountUsd: item.amountUsd,
  }));
};
