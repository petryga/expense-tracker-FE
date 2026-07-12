import { createApi } from '@reduxjs/toolkit/query/react';
import { getMonthlyDataUrl } from './helpers';
import { GetArgs, MonthlyData } from './monthlyData.types';
import { normalizeGetMonthlyData } from './normalizers';
import { baseQueryWithAuth } from '../api';

export const monthlyDataApi = createApi({
  reducerPath: 'monthlyDataApi',
  tagTypes: ['Expense', 'MonthlyData'],
  baseQuery: baseQueryWithAuth,

  endpoints: (builder) => ({
    getMonthlyData: builder.query<MonthlyData[], GetArgs>({
      query: () => ({
        url: getMonthlyDataUrl(),
        method: 'GET',
      }),
      transformResponse: (response: MonthlyData[], _, { type }) =>
        normalizeGetMonthlyData(response, type),
      providesTags: [{ type: 'MonthlyData', id: 'LIST' }],
    }),
  }),
});

export const { useGetMonthlyDataQuery } = monthlyDataApi;
