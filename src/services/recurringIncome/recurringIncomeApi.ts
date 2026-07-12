import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  DeleteRecurringIncomeArgs,
  GetArgs,
  PostArgs,
  PutArgs,
  RecurringIncomeData,
} from './recurringIncomeApi.types';
import { getRecurringIncomeUrl, getRecurringIncomeByIdUrl } from './helpers';
import { baseQueryWithAuth } from '../api';

export const recurringIncomeApi = createApi({
  reducerPath: 'recurringIncomeApi',
  tagTypes: ['RecurringIncome'],
  baseQuery: baseQueryWithAuth,

  endpoints: (builder) => ({
    getRecurringIncome: builder.query<RecurringIncomeData[], GetArgs>({
      query: () => ({
        url: getRecurringIncomeUrl(),
        method: 'GET',
      }),
      providesTags: [{ type: 'RecurringIncome', id: 'LIST' }],
    }),

    createRecurringIncome: builder.mutation<RecurringIncomeData, PostArgs>({
      query: ({ data }) => ({
        url: getRecurringIncomeUrl(),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'RecurringIncome', id: 'LIST' }],
    }),

    updateRecurringIncome: builder.mutation<RecurringIncomeData, PutArgs>({
      query: ({ id, data }) => ({
        url: getRecurringIncomeByIdUrl(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: 'RecurringIncome', id: 'LIST' }],
    }),

    deleteRecurringIncome: builder.mutation<void, DeleteRecurringIncomeArgs>({
      query: ({ id }) => ({
        url: getRecurringIncomeByIdUrl(id),
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RecurringIncome', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRecurringIncomeQuery,
  useCreateRecurringIncomeMutation,
  useUpdateRecurringIncomeMutation,
  useDeleteRecurringIncomeMutation,
} = recurringIncomeApi;
