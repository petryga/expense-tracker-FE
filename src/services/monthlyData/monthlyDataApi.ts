import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getMonthlyDataUrl } from './helpers';
import { GetArgs, MonthlyData } from './monthlyData.types';
import { normalizeGetMonthlyData } from './normalizers';
import { API_BASE_URL } from '../api';

export const monthlyDataApi = createApi({
  reducerPath: 'monthlyDataApi',
  tagTypes: ['Expense', 'MonthlyData'],
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/` }),

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
