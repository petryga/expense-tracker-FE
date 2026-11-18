import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../api';

// The spending assistant: questions about your own data, answered by an agent
// that reads it through read-only tools. It never changes anything.

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface AskArgs {
  question: string;
  history: ChatTurn[];
}

export interface AskResult {
  answer: string;
  // "answered", or why it stopped early: "max_steps", "timeout", "model_error".
  outcome: string;
  toolCalls: string[];
}

// perVisitorDailyLimit: only for the public demo account.
export interface AssistantStatus {
  enabled: boolean;
  perVisitorDailyLimit?: number;
}

export const assistantApi = createApi({
  reducerPath: 'assistantApi',
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getAssistantStatus: builder.query<AssistantStatus, void>({
      query: () => ({ url: 'assistant', method: 'GET' }),
    }),
    ask: builder.mutation<AskResult, AskArgs>({
      query: (body) => ({ url: 'assistant', method: 'POST', body }),
    }),
  }),
});

export const { useGetAssistantStatusQuery, useAskMutation } = assistantApi;
