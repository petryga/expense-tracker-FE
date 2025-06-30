import { format } from 'date-fns';
import type { Data } from '../../services/expenses/expensesApi.types';
import type { Category, RecurringExpense } from './ExpensesPage.types';

export enum AccountType {
  TD_SAVINGS = 'TD Savings',
  AMEX = 'Amex',
  ROGERS = 'Rogers',
  BOFA_CREDIT = 'BofA Credit',
  BOFA_SAVINGS = 'BofA Debit',
  CASH = 'Cash',
}

export enum Currency {
  CAD = 'CAD',
  USD = 'USD',
}

export const BUDGETS: Record<string, number> = {
  Electricity: 60,
  Groceries: 400,
  'Eating Out': 20,
  'Coffee Shops': 20,
  'Taxi & Ride Shares': 50,
  'Travel & Vacation': 100,
  Entertainment: 50,
  Books: 20,
  Clothing: 200,
  Beauty: 50,
  'Furniture & Housewares': 100,
  Gifts: 100,
};

export const CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Bills',
    subcategories: [
      { id: 101, name: 'Rent' },
      { id: 102, name: 'Electricity' },
      { id: 103, name: 'Internet' },
      { id: 104, name: 'Mobile Phone' },
    ],
  },
  {
    id: 2,
    name: 'Fees',
    subcategories: [
      { id: 201, name: 'Financial Fees' },
      { id: 202, name: 'Legal Fees' },
    ],
  },
  {
    id: 3,
    name: 'Food & Dining',
    subcategories: [
      { id: 301, name: 'Groceries' },
      { id: 302, name: 'Eating Out' },
      { id: 303, name: 'Coffee Shops' },
    ],
  },
  {
    id: 4,
    name: 'Transportation',
    subcategories: [
      { id: 401, name: 'Public Transport' },
      { id: 402, name: 'Taxi & Ride Shares' },
    ],
  },
  {
    id: 5,
    name: 'Lifestyle',
    subcategories: [
      { id: 501, name: 'Subscriptions' },
      { id: 502, name: 'Travel & Vacation' },
      { id: 503, name: 'Entertainment' },
      { id: 504, name: 'Books' },
      { id: 505, name: 'Pets' },
    ],
  },
  {
    id: 6,
    name: 'Shopping',
    subcategories: [
      { id: 601, name: 'Clothing' },
      { id: 602, name: 'Household Goods' },
      { id: 603, name: 'Furniture & Housewares' },
      { id: 604, name: 'Beauty' },
      { id: 605, name: 'Hobbies' },
    ],
  },
  {
    id: 7,
    name: 'Health',
    subcategories: [
      { id: 701, name: 'Medical Expenses' },
      { id: 702, name: 'Pharmacy' },
      { id: 703, name: 'Wellness & Spa' },
    ],
  },
  {
    id: 8,
    name: 'Gifts',
    subcategories: [{ id: 901, name: 'Gifts' }],
  },
];

export const getDataByMonth = (
  expenses?: Data[]
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

export const recurringExpenses: RecurringExpense[] = [
  {
    dayPosted: '14',
    account: AccountType.ROGERS,
    description: 'Spotify Subscription',
    category: 'Subscriptions',
    currency: Currency.CAD,
    amount: 14.21,
  },
  {
    dayPosted: '16',
    account: AccountType.ROGERS,
    description: 'Claude Subscription',
    category: 'Subscriptions',
    currency: Currency.CAD,
    amount: 30,
  },
  {
    dayPosted: '22',
    account: AccountType.ROGERS,
    description: 'Mobile Phone',
    category: 'Mobile Phone',
    currency: Currency.CAD,
    amount: 38.42,
  },
  {
    dayPosted: '28',
    account: AccountType.TD_SAVINGS,
    description: 'Account Fee',
    category: 'Legal Fees',
    currency: Currency.CAD,
    amount: 3.95,
  },
];

export const getCurrentMonthPath = () => {
  const currentMonth = format(new Date(), 'yyyy-MM');
  return `/expenses/${currentMonth}`;
};

export const accountCurrencyMap: Record<AccountType, Currency> = {
  [AccountType.TD_SAVINGS]: Currency.CAD,
  [AccountType.AMEX]: Currency.USD,
  [AccountType.ROGERS]: Currency.CAD,
  [AccountType.BOFA_CREDIT]: Currency.USD,
  [AccountType.BOFA_SAVINGS]: Currency.USD,
  [AccountType.CASH]: Currency.USD,
};

export const processExpensesData = (
  expenses?: Data[]
): { [key: string]: { [key: string]: Data[] } } => {
  // If no expenses, return default structure for current month
  if (!expenses || !expenses.length) {
    const thisMonthAndYear = new Date().toISOString().slice(0, 7);
    return { [thisMonthAndYear.split('-')[0]]: {} };
  }

  // Transform data into month-based grouping
  const dataByMonth = expenses.reduce<{ [key: string]: Data[] }>((acc, expense) => {
    const month = new Date(expense.datePosted).toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(expense);
    return acc;
  }, {});

  // Sort months in descending order
  const sortedMonths = Object.keys(dataByMonth).sort((a, b) => (a < b ? 1 : -1));

  // Group data by year, maintaining the sorted order
  return sortedMonths.reduce<{ [key: string]: { [key: string]: Data[] } }>((acc, yearMonth) => {
    const [year, month] = yearMonth.split('-');
    if (!acc[year]) acc[year] = {};
    acc[year][month] = dataByMonth[yearMonth];
    return acc;
  }, {});
};

export const paymentOptions = [
  AccountType.TD_SAVINGS,
  AccountType.AMEX,
  AccountType.ROGERS,
  AccountType.BOFA_CREDIT,
  AccountType.BOFA_SAVINGS,
  AccountType.CASH,
];
