import { GetExpensesData, NewDataResponse } from './expensesApi.types';

export const normalizeGetAllExpensesData = (data: NewDataResponse): GetExpensesData => {
  if (!data) {
    return {
      data: [],
      expensesTotal: {
        totalAmountThisMonthCad: 0,
        totalAmountThisMonthUsd: 0,
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
      totalAmountThisMonthCad: data.expensesTotal.totalAmountThisMonthCad || 0,
      totalAmountThisMonthUsd: data.expensesTotal.totalAmountThisMonthUsd || 0,
      totalAmountAllTime: data.expensesTotal.totalAmountAllTime || 0,
    },
  };
};

export const normalizeGetAllSearchedData = (data: NewDataResponse): GetExpensesData => {
  if (!data.data) {
    return {
      data: [],
      expensesTotal: {
        totalAmountThisMonthCad: 0,
        totalAmountThisMonthUsd: 0,
        totalAmountAllTime: 0,
        totalAmountSearchResultsCad: 0,
        totalAmountSearchResultsUsd: 0,
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
      totalAmountSearchResultsCad: data.expensesTotal.totalAmountSearchResultsCad || 0,
      totalAmountSearchResultsUsd: data.expensesTotal.totalAmountSearchResultsUsd || 0,
      totalAmountThisMonthCad: 0,
      totalAmountThisMonthUsd: 0,
      totalAmountAllTime: 0,
    },
  };
};
