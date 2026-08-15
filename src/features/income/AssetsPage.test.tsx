// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { AssetsPage } from './AssetsPage';

afterEach(cleanup);

vi.mock('../../services/income/incomeApi', () => ({
  useGetIncomeEntriesQuery: () => ({ data: undefined, isLoading: false, isFetching: false }),
  useCreateIncomeEntryMutation: () => [vi.fn()],
  useUpdateIncomeEntryMutation: () => [vi.fn()],
  useDeleteIncomeEntryMutation: () => [vi.fn()],
}));

vi.mock('../../services/recurringIncome/recurringIncomeApi', () => ({
  useGetRecurringIncomeQuery: () => ({ data: [] }),
}));

describe('AssetsPage', () => {
  it('renders the Add entry / Add recurring toolbar', () => {
    // Regression test: MUI X DataGrid v7+ added a `showToolbar` prop
    // (default false) gating whether slots.toolbar renders at all -- without
    // it, the "Add entry"/"Add recurring" bar silently disappeared even
    // though slots.toolbar was still set. Tests the unwrapped named export
    // (not the default withSidebar()-wrapped one) to avoid pulling in
    // Sidebar's own auth/routing/Redux dependencies.
    render(<AssetsPage />);

    expect(screen.getByText('Add entry')).toBeInTheDocument();
    expect(screen.getByText('Add recurring')).toBeInTheDocument();
  });
});
