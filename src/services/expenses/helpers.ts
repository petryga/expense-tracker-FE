export const getExpensesUrl = (searchTerm?: string, yearMonth?: string) => {
  const params = new URLSearchParams();
  if (searchTerm) params.set("search", searchTerm);
  if (yearMonth) params.set("yearMonth", yearMonth);

  const queryString = params.toString();
  return `expenses${queryString ? `?${queryString}` : ""}`;
};

export const getExpensesByIdUrl = (id: string) => {
  return `expenses/${id}`;
};
