import type { GetArgs } from './monthlyData.types';

export const getMonthlyDataUrl = ({ type, category, currency }: GetArgs = {}) => {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (category) params.set('category', category);
  if (currency) params.set('currency', currency);

  const queryString = params.toString();
  return `monthlyData${queryString ? `?${queryString}` : ''}`;
};
