import { createApi } from '@reduxjs/toolkit/query/react';
import type { AccountRecord, DeleteAccountArgs, GetArgs, PostArgs } from './accountsApi.types';
import { getAccountsUrl, getAccountByIdUrl } from './helpers';
import { baseQueryWithAuth } from '../api';

export const accountsApi = createApi({
  reducerPath: 'accountsApi',
  tagTypes: ['Account'],
  baseQuery: baseQueryWithAuth,

  endpoints: (builder) => ({
    getAccounts: builder.query<AccountRecord[], GetArgs>({
      query: () => ({
        url: getAccountsUrl(),
        method: 'GET',
      }),
      providesTags: [{ type: 'Account', id: 'LIST' }],
    }),

    createAccount: builder.mutation<AccountRecord, PostArgs>({
      query: ({ data }) => ({
        url: getAccountsUrl(),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),

    deleteAccount: builder.mutation<void, DeleteAccountArgs>({
      query: ({ id }) => ({
        url: getAccountByIdUrl(id),
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),
  }),
});

export const { useGetAccountsQuery, useCreateAccountMutation, useDeleteAccountMutation } =
  accountsApi;
