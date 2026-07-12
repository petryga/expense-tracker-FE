import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  DeleteRecurringExpenseArgs,
  GetArgs,
  PostArgs,
  PutArgs,
  RecurringExpenseData,
} from './recurringExpensesApi.types';
import { getRecurringExpensesUrl, getRecurringExpensesByIdUrl } from './helpers';
import { baseQueryWithAuth } from '../api';

export const recurringExpensesApi = createApi({
  reducerPath: 'recurringExpensesApi',
  tagTypes: ['RecurringExpense'],
  baseQuery: baseQueryWithAuth,

  endpoints: (builder) => ({
    getRecurringExpenses: builder.query<RecurringExpenseData[], GetArgs>({
      query: () => ({
        url: getRecurringExpensesUrl(),
        method: 'GET',
      }),
      providesTags: [{ type: 'RecurringExpense', id: 'LIST' }],
    }),

    createRecurringExpense: builder.mutation<RecurringExpenseData, PostArgs>({
      query: ({ data }) => ({
        url: getRecurringExpensesUrl(),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'RecurringExpense', id: 'LIST' }],
    }),

    updateRecurringExpense: builder.mutation<RecurringExpenseData, PutArgs>({
      query: ({ id, data }) => ({
        url: getRecurringExpensesByIdUrl(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: 'RecurringExpense', id: 'LIST' }],
    }),

    deleteRecurringExpense: builder.mutation<void, DeleteRecurringExpenseArgs>({
      query: ({ id }) => ({
        url: getRecurringExpensesByIdUrl(id),
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RecurringExpense', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRecurringExpensesQuery,
  useCreateRecurringExpenseMutation,
  useUpdateRecurringExpenseMutation,
  useDeleteRecurringExpenseMutation,
} = recurringExpensesApi;
