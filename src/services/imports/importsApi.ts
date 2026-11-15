import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../api';
import { expensesApi } from '../expenses/expensesApi';
import { monthlyDataApi } from '../monthlyData/monthlyDataApi';
import type {
  ConfirmArgs,
  ConfirmResult,
  ImportDetail,
  ImportList,
  UploadArgs,
  UploadNothingNew,
} from './importsApi.types';

// Statement import: upload a card CSV, review the drafts, confirm.
export const importsApi = createApi({
  reducerPath: 'importsApi',
  tagTypes: ['Import'],
  baseQuery: baseQueryWithAuth,

  endpoints: (builder) => ({
    getImports: builder.query<ImportList, void>({
      query: () => ({ url: 'imports', method: 'GET' }),
      providesTags: [{ type: 'Import', id: 'LIST' }],
    }),

    getImport: builder.query<ImportDetail, string>({
      query: (id) => ({ url: `imports/${id}`, method: 'GET' }),
      providesTags: (_result, _error, id) => [{ type: 'Import', id }],
    }),

    uploadStatement: builder.mutation<ImportDetail | UploadNothingNew, UploadArgs>({
      query: (body) => ({ url: 'imports', method: 'POST', body }),
      // A new upload can pair refunds with purchases in older imports.
      invalidatesTags: ['Import'],
    }),

    // Demo account only: loads the synthetic statement bundled with the BE.
    importSampleStatement: builder.mutation<ImportDetail | UploadNothingNew, void>({
      query: () => ({ url: 'imports/sample', method: 'POST' }),
      invalidatesTags: ['Import'],
    }),

    confirmImport: builder.mutation<ConfirmResult, ConfirmArgs>({
      query: ({ id, rows }) => ({ url: `imports/${id}/confirm`, method: 'POST', body: { rows } }),
      invalidatesTags: ['Import'],
      // Saving (or returning) changes expenses, which live in other API slices.
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(expensesApi.util.invalidateTags([{ type: 'Expense', id: 'LIST' }]));
          dispatch(monthlyDataApi.util.invalidateTags([{ type: 'MonthlyData', id: 'LIST' }]));
        } catch {
          // The page shows the error from the mutation result.
        }
      },
    }),

    // Skipped rows back to "to review".
    reopenRows: builder.mutation<
      { reopened: number; import: ImportDetail },
      { id: string; rowIds: string[] }
    >({
      query: ({ id, rowIds }) => ({
        url: `imports/${id}/reopen`,
        method: 'POST',
        body: { rowIds },
      }),
      invalidatesTags: ['Import'],
    }),

    // Deletes an import's rows; its saved expenses go too unless keepExpenses.
    deleteImport: builder.mutation<
      { deletedExpenses: number },
      { id: string; keepExpenses: boolean }
    >({
      query: ({ id, keepExpenses }) => ({
        url: `imports/${id}${keepExpenses ? '?keepExpenses=true' : ''}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Import'],
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(expensesApi.util.invalidateTags([{ type: 'Expense', id: 'LIST' }]));
          dispatch(monthlyDataApi.util.invalidateTags([{ type: 'MonthlyData', id: 'LIST' }]));
        } catch {
          // The page shows the error from the mutation result.
        }
      },
    }),
  }),
});

export const {
  useGetImportsQuery,
  useGetImportQuery,
  useUploadStatementMutation,
  useImportSampleStatementMutation,
  useConfirmImportMutation,
  useDeleteImportMutation,
  useReopenRowsMutation,
} = importsApi;
