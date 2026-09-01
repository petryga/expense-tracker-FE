import { configureStore } from '@reduxjs/toolkit';
import { expensesApi } from './services/expenses/expensesApi';
import { incomeApi } from './services/income/incomeApi';
import { monthlyDataApi } from './services/monthlyData/monthlyDataApi';
import { recurringExpensesApi } from './services/recurringExpenses/recurringExpensesApi';
import { recurringIncomeApi } from './services/recurringIncome/recurringIncomeApi';
import { categoriesApi } from './services/categories/categoriesApi';
import { accountsApi } from './services/accounts/accountsApi';
import sidebarReducer from './components/sidebar/sidebarSlice';

export const store = configureStore({
  reducer: {
    [expensesApi.reducerPath]: expensesApi.reducer,
    [incomeApi.reducerPath]: incomeApi.reducer,
    [monthlyDataApi.reducerPath]: monthlyDataApi.reducer,
    [recurringExpensesApi.reducerPath]: recurringExpensesApi.reducer,
    [recurringIncomeApi.reducerPath]: recurringIncomeApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [accountsApi.reducerPath]: accountsApi.reducer,
    rightSidebar: sidebarReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      expensesApi.middleware,
      monthlyDataApi.middleware,
      incomeApi.middleware,
      recurringExpensesApi.middleware,
      recurringIncomeApi.middleware,
      categoriesApi.middleware,
      accountsApi.middleware,
    ),
});

export const rootReducer = {
  expenses: expensesApi.reducer,
  income: incomeApi.reducer,
  monthlyData: monthlyDataApi.reducer,
  recurringExpenses: recurringExpensesApi.reducer,
  recurringIncome: recurringIncomeApi.reducer,
  categories: categoriesApi.reducer,
  accounts: accountsApi.reducer,
};

export type RootState = ReturnType<typeof store.getState>;
