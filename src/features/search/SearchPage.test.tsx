// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { SearchPage } from './SearchPage';
import { installFakeApi } from '../../test/fakeApi';
import { renderWithStore } from '../../test/renderWithStore';

const expense = (overrides: Record<string, unknown> = {}) => ({
  id: 'e1',
  datePosted: '2024-06-22',
  account: 'Cash',
  description: 'scented candle',
  category: 'Uncategorized',
  amount: '24.00',
  year: 2024,
  month: 6,
  currency: 'USD',
  isGift: true,
  ...overrides,
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('SearchPage', () => {
  it('edits a search result in place, like the expenses grid', async () => {
    const api = installFakeApi({
      expenses: () => ({ data: [expense()], expensesTotal: {} }),
      'expenses/e1': () => expense({ category: 'Household Goods' }),
      categories: () => [
        { id: 'h', name: 'Home', parentCategoryId: null, isDefault: false, budget: null },
        { id: 'g', name: 'Household Goods', parentCategoryId: 'h', isDefault: false, budget: null },
      ],
      accounts: () => [{ id: 'a', name: 'Cash', currency: 'USD', isDefault: true }],
    });
    renderWithStore(<SearchPage />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Uncategorized' } });
    const grid = await screen.findByRole('grid', {}, { timeout: 3000 });
    expect(
      await within(grid).findByText('scented candle', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    // The old category still shows, and the gift tick.
    expect(within(grid).getByText('Uncategorized')).toBeInTheDocument();
    expect(within(grid).getByText('✓')).toBeInTheDocument();

    fireEvent.click(within(grid).getByRole('menuitem', { name: 'Edit' }));
    const pickers = await within(grid).findAllByRole('combobox');
    const categoryPicker = pickers[pickers.length - 1];
    fireEvent.mouseDown(categoryPicker);
    fireEvent.click(await screen.findByRole('option', { name: 'Home - Household Goods' }));
    fireEvent.click(within(grid).getByRole('menuitem', { name: 'Save' }));

    const put = await waitFor(() => {
      const call = vi
        .mocked(fetch)
        .mock.calls.find(([input]) => (input as Request).method === 'PUT');
      expect(call).toBeDefined();
      return call!;
    });
    expect(new URL((put[0] as Request).url).pathname).toBe('/expenses/e1');
    expect(await (put[0] as Request).json()).toMatchObject({
      id: 'e1',
      category: 'Household Goods',
      isGift: true,
    });
    expect(api.unhandled).toEqual([]);
  }, 10000);
});
