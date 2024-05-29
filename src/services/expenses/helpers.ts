export const getExpensesUrl = (searchTerm?: string, yearMonth?: string) => {
  return `expenses${searchTerm ? `?search=${searchTerm}` : ""}${
    yearMonth ? `?yearMonth=${yearMonth}` : ""
  }`;
};

export const getExpensesByIdUrl = (id: string) => {
  return `expenses/${id}`;
};
