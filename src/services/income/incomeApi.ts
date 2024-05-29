import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  PostArgs,
  IncomeData,
  PutArgs,
  GetArgs,
  DeleteIncomeEntryArgs,
} from './incomeApi.types';
import { getIncomeEntriesUrl, getIncomeEntriesByIdUrl } from './helpers';

export const incomeApi = createApi({
  reducerPath: 'incomeApi',
  tagTypes: ['Income', 'MonthlyData'],
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/' }),

  endpoints: (builder) => ({
    getIncomeEntries: builder.query<IncomeData[], GetArgs>({
      query: () => ({
        url: getIncomeEntriesUrl(),
        method: 'GET',
      }),
      providesTags: [{ type: 'Income', id: 'LIST' }],
    }),

    createIncomeEntry: builder.mutation<IncomeData | IncomeData[], PostArgs>({
      query: ({ data }) => ({
        url: getIncomeEntriesUrl(),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Income', id: 'LIST' },
        { type: 'MonthlyData', id: 'LIST' },
      ],
    }),

    updateIncomeEntry: builder.mutation<IncomeData, PutArgs>({
      query: ({ id, data }) => ({
        url: getIncomeEntriesByIdUrl(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Income', id: 'LIST' },
        { type: 'MonthlyData', id: 'LIST' },
      ],
    }),

    deleteIncomeEntry: builder.mutation<void, DeleteIncomeEntryArgs>({
      query: ({ id }) => ({
        url: getIncomeEntriesByIdUrl(id),
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Income', id: 'LIST' },
        { type: 'MonthlyData', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetIncomeEntriesQuery,
  useCreateIncomeEntryMutation,
  useUpdateIncomeEntryMutation,
  useDeleteIncomeEntryMutation,
} = incomeApi;
