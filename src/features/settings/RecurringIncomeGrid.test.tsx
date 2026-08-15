// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { RecurringIncomeGrid } from './RecurringIncomeGrid';

afterEach(cleanup);

vi.mock('../../services/recurringIncome/recurringIncomeApi', () => ({
  useGetRecurringIncomeQuery: () => ({ data: [], isLoading: false, isFetching: false }),
  useCreateRecurringIncomeMutation: () => [vi.fn()],
  useUpdateRecurringIncomeMutation: () => [vi.fn()],
  useDeleteRecurringIncomeMutation: () => [vi.fn()],
}));

describe('RecurringIncomeGrid', () => {
  it('renders the Add entry toolbar', () => {
    // Regression test: MUI X DataGrid v7+ added a `showToolbar` prop
    // (default false) gating whether slots.toolbar renders at all -- without
    // it, the "Add entry" bar silently disappeared even though
    // slots.toolbar was still set.
    render(<RecurringIncomeGrid />);

    expect(screen.getByText('Add entry')).toBeInTheDocument();
  });
});
