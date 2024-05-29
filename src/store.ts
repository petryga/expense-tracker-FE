import { configureStore } from '@reduxjs/toolkit';
import { expensesApi } from './services/expenses/expensesApi';
import { incomeApi } from './services/income/incomeApi';
import { monthlyDataApi } from './services/monthlyData/monthlyDataApi';
import sidebarReducer from './components/sidebar/sidebarSlice';

export const store = configureStore({
  reducer: {
    [expensesApi.reducerPath]: expensesApi.reducer,
    [incomeApi.reducerPath]: incomeApi.reducer,
    [monthlyDataApi.reducerPath]: monthlyDataApi.reducer,
    rightSidebar: sidebarReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      expensesApi.middleware,
      monthlyDataApi.middleware,
      incomeApi.middleware
    ),
});

export const rootReducer = {
  expenses: expensesApi.reducer,
  income: incomeApi.reducer,
  monthlyData: monthlyDataApi.reducer,
};

export type RootState = ReturnType<typeof store.getState>;
