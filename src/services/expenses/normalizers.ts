import { GetExpensesData, NewDataResponse } from "./expensesApi.types";

export const normalizeGetAllExpensesData = (
  data: NewDataResponse
): GetExpensesData => {
  if (!data) {
    return {
      data: [],
      expensesTotal: {
        totalAmountThisMonth: 0,
        totalAmountAllTime: 0,
      },
    };
  }
  const expenseData = data.data.map((expense) => {
    return {
      ...expense,
      amount: parseFloat(expense.amount),
    };
  });

  return {
    data: expenseData,
    expensesTotal: {
      totalAmountThisMonth: data.expensesTotal.totalAmountThisMonth || 0,
      totalAmountAllTime: data.expensesTotal.totalAmountAllTime || 0,
    },
  };
};

export const normalizeGetAllSearchedData = (
  data: NewDataResponse
): GetExpensesData => {
  if (!data.data) {
    return {
      data: [],
      expensesTotal: {
        totalAmountThisMonth: 0,
        totalAmountAllTime: 0,
        totalAmountSearchResults: 0,
      },
    };
  }

  const expenseData = data.data.map((expense) => {
    return {
      ...expense,
      amount: parseFloat(expense.amount),
    };
  });

  return {
    data: expenseData,
    expensesTotal: {
      totalAmountSearchResults:
        data.expensesTotal.totalAmountSearchResults || 0,
      totalAmountThisMonth: 0,
      totalAmountAllTime: 0,
    },
  };
};
