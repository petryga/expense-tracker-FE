// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { AllTimeReportsPage } from './AllTimeReportsPage';
import { installFakeApi } from '../../../test/fakeApi';
import { renderWithStore } from '../../../test/renderWithStore';

vi.mock('recharts', async () => (await import('../../../test/rechartsMock')).rechartsMock);

const row = (yearMonth: string, amountCad: string, amountUsd: string, type = 'income') => ({
  id: `${type}-${yearMonth}`,
  type,
  yearMonth,
  amountCad,
  amountUsd,
});

// All income across categories vs. one category, as the BE would sum them.
const monthlyData = (url: URL) => {
  const category = url.searchParams.get('category');
  const currency = url.searchParams.get('currency');
  if (category === 'bankAccounts' && currency === 'USD') {
    return [row('2026-01', '0.00', '100.00'), row('2026-02', '0.00', '120.00')];
  }
  return [
    row('2026-01', '50.00', '300.00'),
    row('2026-02', '60.00', '320.00'),
    row('2026-01', '5.00', '0.00', 'expense'),
  ];
};

const routes = () => ({
  monthlyData,
  recurringIncome: () => [
    { id: 'r1', description: 'Chequing', category: 'bankAccounts', currency: 'USD', amount: 0 },
    { id: 'r2', description: 'Fund', category: 'investments', currency: 'CAD', amount: 0 },
    { id: 'r3', description: 'Chequing 2', category: 'bankAccounts', currency: 'USD', amount: 0 },
  ],
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const chart = () =>
  within(screen.getByTestId('chart-data'))
    .getAllByRole('listitem')
    .map((item) => item.textContent);

describe('AllTimeReportsPage - Monthly Wealth', () => {
  it('lists one "category - currency" option per recurring entry, plus the total', async () => {
    installFakeApi(routes());
    renderWithStore(<AllTimeReportsPage />, { route: '/?tab=monthly-wealth' });

    const select = (await screen.findByLabelText('Category')) as HTMLSelectElement;
    await waitFor(() => expect(select.options.length).toBe(3));

    expect([...select.options].map((option) => option.textContent)).toEqual([
      'All (total)',
      'Bank Accounts - USD',
      'Investments - CAD',
    ]);
    expect(select.value).toBe('__all__');
  });

  it('shows the all-category total by default', async () => {
    installFakeApi(routes());
    renderWithStore(<AllTimeReportsPage />, { route: '/?tab=monthly-wealth' });

    await waitFor(() =>
      expect(chart()).toEqual([
        'yearMonth=2026-01 amountCad=50 amountUsd=300',
        'yearMonth=2026-02 amountCad=60 amountUsd=320',
      ]),
    );
  });

  it('asks the BE for just the chosen category and currency, then returns to the total', async () => {
    const api = installFakeApi(routes());
    renderWithStore(<AllTimeReportsPage />, { route: '/?tab=monthly-wealth' });
    const select = (await screen.findByLabelText('Category')) as HTMLSelectElement;
    await waitFor(() => expect(select.options.length).toBe(3));

    fireEvent.change(select, { target: { value: select.options[1].value } });

    await waitFor(() =>
      expect(chart()).toEqual([
        'yearMonth=2026-01 amountCad=0 amountUsd=100',
        'yearMonth=2026-02 amountCad=0 amountUsd=120',
      ]),
    );
    const filtered = api
      .callsTo('monthlyData')
      .find((url) => url.searchParams.has('category'))!.searchParams;
    expect(Object.fromEntries(filtered)).toEqual({
      type: 'income',
      category: 'bankAccounts',
      currency: 'USD',
    });

    fireEvent.change(select, { target: { value: '__all__' } });

    await waitFor(() => expect(chart()[0]).toBe('yearMonth=2026-01 amountCad=50 amountUsd=300'));
    expect(api.unhandled).toEqual([]);
  });

  it('never shows the all-category numbers while a category is still loading', async () => {
    // Showing the total under a category's name would be silently wrong data.
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    const api = installFakeApi(routes());
    const original = globalThis.fetch;
    vi.stubGlobal('fetch', async (input: Request | string) => {
      const url = new URL(typeof input === 'string' ? input : input.url);
      if (url.searchParams.has('category')) await gate;
      return original(input as Request);
    });
    renderWithStore(<AllTimeReportsPage />, { route: '/?tab=monthly-wealth' });
    const select = (await screen.findByLabelText('Category')) as HTMLSelectElement;
    await waitFor(() => expect(select.options.length).toBe(3));

    fireEvent.change(select, { target: { value: select.options[1].value } });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText('yearMonth=2026-01 amountCad=50 amountUsd=300')).toBeNull();
    release();
    await waitFor(() => expect(chart()[0]).toBe('yearMonth=2026-01 amountCad=0 amountUsd=100'));
    expect(api.calls.length).toBeGreaterThan(0);
  });
});

describe('AllTimeReportsPage - controls per tab', () => {
  it('shows Range but not Category on Monthly Expenses', async () => {
    installFakeApi(routes());
    renderWithStore(<AllTimeReportsPage />, { route: '/?tab=monthly-expenses' });

    expect(await screen.findByLabelText('Range')).toBeInTheDocument();
    expect(screen.queryByLabelText('Category')).not.toBeInTheDocument();
  });

  it('shows neither on Yearly Comparison, which has its own controls', async () => {
    installFakeApi({
      ...routes(),
      'reports/yearly-comparison': () => ({
        rows: [],
        ytdCutoffOptionsByYear: {},
        defaultYtdCutoffByYear: {},
      }),
    });
    renderWithStore(<AllTimeReportsPage />, { route: '/?tab=yearly-comparison' });

    expect(await screen.findByText('Total expenses by year')).toBeInTheDocument();
    expect(screen.queryByLabelText('Range')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Category')).not.toBeInTheDocument();
  });
});
