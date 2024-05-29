import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getMonthlyDataByIdUrl, getMonthlyDataUrl } from './helpers';
import { DeleteArgs, GetArgs, MonthlyData, PatchArgs, PostArgs } from './monthlyData.types';
import { normalizeGetMonthlyData } from './normalizers';

export const monthlyDataApi = createApi({
  reducerPath: 'monthlyDataApi',
  tagTypes: ['Expense', 'MonthlyData'],
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/' }),

  endpoints: (builder) => ({
    getMonthlyData: builder.query<MonthlyData[], GetArgs>({
      query: () => ({
        url: getMonthlyDataUrl(),
        method: 'GET',
      }),
      transformResponse: (response: MonthlyData[], _, { type }) => {
        return normalizeGetMonthlyData(response, type);
      },
      providesTags: [{ type: 'MonthlyData', id: 'LIST' }],
    }),
  }),
});

export const { useGetMonthlyDataQuery } = monthlyDataApi;
