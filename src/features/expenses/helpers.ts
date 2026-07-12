import { format } from "date-fns";
import type { Data } from "../../services/expenses/expensesApi.types";
import type { Category } from "./ExpensesPage.types";
import type { CategoryRecord } from "../../services/categories/categoriesApi.types";

export enum AccountType {
  TD_SAVINGS = "TD Savings",
  AMEX = "Amex",
  BOFA_SAVINGS = "BofA Debit",
  CASH = "Cash",
  ROGERS = "Rogers",
}

export enum Currency {
  CAD = "CAD",
  USD = "USD",
}

export const buildCategoryTree = (categories: CategoryRecord[]): Category[] => {
  const topLevel = categories.filter((category) => !category.parentCategoryId);

  return topLevel.map((category) => ({
    id: category.id,
    name: category.name,
    subcategories: categories
      .filter((subcategory) => subcategory.parentCategoryId === category.id)
      .map((subcategory) => ({ id: subcategory.id, name: subcategory.name })),
  }));
};

export const getDataByMonth = (
  expenses?: Data[],
): {
  [key: string]: Data[];
} => {
  if (!expenses || !expenses.length) {
    const thisMonthAndYear = new Date().toISOString().slice(0, 7);
    return { [thisMonthAndYear]: [] };
  }

  const data = expenses?.reduce<{ [key: string]: Data[] }>((acc, expense) => {
    const month = new Date(expense.datePosted).toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(expense);
    return acc;
  }, {});

  return Object.keys(data)
    .sort((a, b) => (a < b ? 1 : -1))
    .reduce<{ [key: string]: Data[] }>((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});
};

export const getCurrentMonthPath = () => {
  const currentMonth = format(new Date(), "yyyy-MM");
  return `/expenses/${currentMonth}`;
};

export const accountCurrencyMap: Record<AccountType, Currency> = {
  [AccountType.TD_SAVINGS]: Currency.CAD,
  [AccountType.AMEX]: Currency.USD,
  [AccountType.BOFA_SAVINGS]: Currency.USD,
  [AccountType.CASH]: Currency.USD,
  [AccountType.ROGERS]: Currency.CAD,
};

export const processExpensesData = (
  expenses?: Data[],
): { [key: string]: { [key: string]: Data[] } } => {
  // Transform data into month-based grouping
  const dataByMonth = (expenses ?? []).reduce<{ [key: string]: Data[] }>(
    (acc, expense) => {
      const month = new Date(expense.datePosted).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(expense);
      return acc;
    },
    {},
  );

  // Always keep the current month reachable in the year/month navigation,
  // even with no expenses posted yet — otherwise it disappears from the
  // list entirely as soon as you browse to a different month, with no way
  // back to it short of re-navigating to Expenses from elsewhere.
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  if (!dataByMonth[currentYearMonth]) {
    dataByMonth[currentYearMonth] = [];
  }

  // Sort months in descending order
  const sortedMonths = Object.keys(dataByMonth).sort((a, b) =>
    a < b ? 1 : -1,
  );

  // Group data by year, maintaining the sorted order
  return sortedMonths.reduce<{ [key: string]: { [key: string]: Data[] } }>(
    (acc, yearMonth) => {
      const [year, month] = yearMonth.split("-");
      if (!acc[year]) acc[year] = {};
      acc[year][month] = dataByMonth[yearMonth];
      return acc;
    },
    {},
  );
};

export const paymentOptions = [
  AccountType.TD_SAVINGS,
  AccountType.AMEX,
  AccountType.BOFA_SAVINGS,
  AccountType.CASH,
  AccountType.ROGERS,
];
