import { createApi } from '@reduxjs/toolkit/query/react';
import { getMonthlyDataUrl, getYearlyComparisonUrl } from './helpers';
import {
  GetArgs,
  MonthlyData,
  YearlyComparisonArgs,
  YearlyComparisonResult,
} from './monthlyData.types';
import { normalizeGetMonthlyData } from './normalizers';
import { baseQueryWithAuth } from '../api';

export const monthlyDataApi = createApi({
  reducerPath: 'monthlyDataApi',
  tagTypes: ['Expense', 'MonthlyData'],
  baseQuery: baseQueryWithAuth,

  endpoints: (builder) => ({
    getMonthlyData: builder.query<MonthlyData[], GetArgs>({
      query: (args) => ({
        url: getMonthlyDataUrl(args),
        method: 'GET',
      }),
      transformResponse: (response: MonthlyData[], _, { type }) =>
        normalizeGetMonthlyData(response, type),
      providesTags: [{ type: 'MonthlyData', id: 'LIST' }],
    }),
    getYearlyComparison: builder.query<YearlyComparisonResult, YearlyComparisonArgs>({
      query: (args) => ({ url: getYearlyComparisonUrl(args), method: 'GET' }),
      providesTags: [{ type: 'MonthlyData', id: 'LIST' }],
    }),
  }),
});

export const { useGetMonthlyDataQuery, useGetYearlyComparisonQuery } = monthlyDataApi;
