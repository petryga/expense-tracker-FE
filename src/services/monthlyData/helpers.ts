import type { GetArgs, YearlyComparisonArgs } from './monthlyData.types';

export const getMonthlyDataUrl = ({ type, category, currency }: GetArgs = {}) => {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (category) params.set('category', category);
  if (currency) params.set('currency', currency);

  const queryString = params.toString();
  return `monthlyData${queryString ? `?${queryString}` : ''}`;
};

export const getYearlyComparisonUrl = ({ mode, baseCurrency, cutoffs }: YearlyComparisonArgs) => {
  const params = new URLSearchParams({ mode, baseCurrency });
  const cutoffPairs = Object.entries(cutoffs ?? {}).map(
    ([year, month]) => `${year}:${month === null || month === undefined ? 'none' : month}`,
  );
  if (cutoffPairs.length) params.set('cutoffs', cutoffPairs.join(','));

  return `reports/yearly-comparison?${params.toString()}`;
};
