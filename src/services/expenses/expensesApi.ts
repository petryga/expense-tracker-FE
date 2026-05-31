import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { normalizeGetAllExpensesData, normalizeGetAllSearchedData } from './normalizers';
import type {
  Data,
  DeleteExpenseArgs,
  DeleteExpensesArgs,
  GetArgs,
  GetExpensesData,
  NewDataResponse,
  PatchArgs,
  PostArgs,
} from './expensesApi.types';
import { getExpensesByIdUrl, getExpensesUrl } from './helpers';
import { API_BASE_URL, getApiUrl } from '../api';

export const expensesApi = createApi({
  reducerPath: 'expensesApi',
  tagTypes: ['Expense', 'MonthlyData'],
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/` }),

  endpoints: (builder) => ({
    getExpenses: builder.query<GetExpensesData, GetArgs>({
      query: ({ search, yearMonth }) => ({
        url: getExpensesUrl(search, yearMonth),
        method: 'GET',
      }),
      transformResponse: (response: NewDataResponse, _, { search }) => {
        if (search) {
          return normalizeGetAllSearchedData(response);
        }
        return normalizeGetAllExpensesData(response);
      },
      providesTags: [{ type: 'Expense', id: 'LIST' }],
    }),

    createExpense: builder.mutation<Data | Data[], PostArgs>({
      query: ({ data }) => ({
        url: getExpensesUrl(),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Expense', id: 'LIST' },
        { type: 'MonthlyData', id: 'LIST' },
      ],
    }),

    updateExpense: builder.mutation<Data, PatchArgs>({
      query: ({ id, data }) => ({
        url: getExpensesByIdUrl(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Expense', id: 'LIST' },
        { type: 'MonthlyData', id: 'LIST' },
      ],
    }),

    deleteExpense: builder.mutation<void, DeleteExpenseArgs>({
      query: ({ id }) => ({
        url: getExpensesByIdUrl(id),
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Expense', id: 'LIST' },
        { type: 'MonthlyData', id: 'LIST' },
      ],
    }),

    deleteExpenses: builder.mutation<void, DeleteExpensesArgs>({
      query: ({ ids }) => ({
        url: getExpensesUrl(),
        method: 'DELETE',
        body: ids,
      }),
      invalidatesTags: [
        { type: 'Expense', id: 'LIST' },
        { type: 'MonthlyData', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useDeleteExpensesMutation,
} = expensesApi;

export const handleDownloadExpenses = async () => {
  try {
    const response = await fetch(getApiUrl('/export'));
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'expenses.csv');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  } catch (error) {
    console.error('Error downloading the file:', error);
  }
};
