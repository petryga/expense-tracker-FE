import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../api';

// The user's marketplaces (Settings): a new expense whose description starts
// with one of them gets it as its merchant (the backend decides).
export interface Marketplace {
  id: string;
  name: string;
}

export const marketplacesApi = createApi({
  reducerPath: 'marketplacesApi',
  tagTypes: ['Marketplace'],
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getMarketplaces: builder.query<Marketplace[], void>({
      query: () => ({ url: '/marketplaces', method: 'GET' }),
      providesTags: [{ type: 'Marketplace', id: 'LIST' }],
    }),
    addMarketplace: builder.mutation<Marketplace, string>({
      query: (name) => ({ url: '/marketplaces', method: 'POST', body: { name } }),
      invalidatesTags: [{ type: 'Marketplace', id: 'LIST' }],
    }),
    deleteMarketplace: builder.mutation<void, string>({
      query: (id) => ({ url: `/marketplaces/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Marketplace', id: 'LIST' }],
    }),
  }),
});

export const { useGetMarketplacesQuery, useAddMarketplaceMutation, useDeleteMarketplaceMutation } =
  marketplacesApi;
