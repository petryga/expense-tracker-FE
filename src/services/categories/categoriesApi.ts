import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  CategoryRecord,
  DeleteCategoryArgs,
  GetArgs,
  PostArgs,
  PutBudgetArgs,
} from './categoriesApi.types';
import { getCategoriesUrl, getCategoryBudgetUrl, getCategoryByIdUrl } from './helpers';
import { baseQueryWithAuth } from '../api';

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  tagTypes: ['Category'],
  baseQuery: baseQueryWithAuth,

  endpoints: (builder) => ({
    getCategories: builder.query<CategoryRecord[], GetArgs>({
      query: () => ({
        url: getCategoriesUrl(),
        method: 'GET',
      }),
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    createCategory: builder.mutation<CategoryRecord, PostArgs>({
      query: ({ data }) => ({
        url: getCategoriesUrl(),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    updateCategoryBudget: builder.mutation<CategoryRecord, PutBudgetArgs>({
      query: ({ id, budget }) => ({
        url: getCategoryBudgetUrl(id),
        method: 'PUT',
        body: { budget },
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    deleteCategory: builder.mutation<void, DeleteCategoryArgs>({
      query: ({ id }) => ({
        url: getCategoryByIdUrl(id),
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryBudgetMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
