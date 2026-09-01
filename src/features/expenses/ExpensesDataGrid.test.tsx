// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ExpensesDataGrid } from './ExpensesDataGrid';

afterEach(cleanup);

vi.mock('../../services/expenses/expensesApi', () => ({
  useGetExpensesQuery: () => ({ data: undefined, isLoading: false, isFetching: false }),
  useCreateExpenseMutation: () => [vi.fn()],
  useUpdateExpenseMutation: () => [vi.fn()],
  useDeleteExpenseMutation: () => [vi.fn()],
  useDeleteExpensesMutation: () => [vi.fn()],
  handleDownloadExpenses: vi.fn(),
}));

vi.mock('../../services/recurringExpenses/recurringExpensesApi', () => ({
  useGetRecurringExpensesQuery: () => ({ data: [] }),
}));

vi.mock('../../services/categories/categoriesApi', () => ({
  useGetCategoriesQuery: () => ({ data: [] }),
}));

vi.mock('../../services/accounts/accountsApi', () => ({
  useGetAccountsQuery: () => ({ data: [] }),
}));

const renderGrid = () =>
  render(
    <MemoryRouter initialEntries={['/expenses/2026-08']}>
      <Routes>
        <Route path="/expenses/:yearMonth" element={<ExpensesDataGrid />} />
      </Routes>
    </MemoryRouter>,
  );

describe('ExpensesDataGrid', () => {
  it('renders the Add entry / Add recurring toolbar', () => {
    // Regression test: MUI X DataGrid v7+ added a `showToolbar` prop
    // (default false) gating whether slots.toolbar renders at all -- without
    // it, the "Add entry"/"Add recurring" bar silently disappeared even
    // though slots.toolbar was still set.
    renderGrid();

    expect(screen.getByText('Add entry')).toBeInTheDocument();
    expect(screen.getByText('Add recurring')).toBeInTheDocument();
  });
});
