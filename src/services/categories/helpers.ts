export const getCategoriesUrl = () => {
  return `/categories`;
};

export const getCategoryBudgetUrl = (id: string) => {
  return `/categories/${id}/budget`;
};

export const getCategoryByIdUrl = (id: string) => {
  return `/categories/${id}`;
};

export const parseBudgetInput = (value: string): number | null => {
  return value.trim() === '' ? null : parseFloat(value);
};
