// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { RecurringExpensesGrid } from './RecurringExpensesGrid';

afterEach(cleanup);

vi.mock('../../services/recurringExpenses/recurringExpensesApi', () => ({
  useGetRecurringExpensesQuery: () => ({ data: [], isLoading: false, isFetching: false }),
  useCreateRecurringExpenseMutation: () => [vi.fn()],
  useUpdateRecurringExpenseMutation: () => [vi.fn()],
  useDeleteRecurringExpenseMutation: () => [vi.fn()],
}));

vi.mock('../../services/categories/categoriesApi', () => ({
  useGetCategoriesQuery: () => ({ data: [] }),
}));

vi.mock('../../services/accounts/accountsApi', () => ({
  useGetAccountsQuery: () => ({ data: [] }),
}));

describe('RecurringExpensesGrid', () => {
  it('renders the Add entry toolbar', () => {
    // Regression test: MUI X DataGrid v7+ added a `showToolbar` prop
    // (default false) gating whether slots.toolbar renders at all -- without
    // it, the "Add entry" bar silently disappeared even though
    // slots.toolbar was still set.
    render(<RecurringExpensesGrid />);

    expect(screen.getByText('Add entry')).toBeInTheDocument();
  });
});
