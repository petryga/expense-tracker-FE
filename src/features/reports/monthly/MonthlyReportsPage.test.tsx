// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { MonthlyReportsPage } from './MonthlyReportsPage';
import { installFakeApi } from '../../../test/fakeApi';
import { renderWithStore } from '../../../test/renderWithStore';

vi.mock('recharts', async () => (await import('../../../test/rechartsMock')).rechartsMock);

const report = (yearMonth: string, rent = 900) => ({
  yearMonth,
  totalSpentCad: 15.5,
  totalSpentUsd: rent + 70,
  dataByCategory: [
    {
      category: `Rent ${yearMonth}`,
      total: rent,
      details: [{ description: 'rent', amount: rent, currency: 'USD' }],
    },
  ],
});

const routes = (months: string[], rent = () => 900) => ({
  'reports/months': () => months,
  'reports/monthly': (url: URL) => report(url.searchParams.get('yearMonth') ?? '', rent()),
  categories: () => [],
});

beforeEach(() => {
  // Only Date is faked, so the "current month" is fixed without freezing timers.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-15T12:00:00'));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('MonthlyReportsPage', () => {
  it('opens on the current month and shows its breakdown from the BE', async () => {
    const api = installFakeApi(routes(['2026-10', '2026-09', '2025-12']));

    renderWithStore(<MonthlyReportsPage />);

    expect(await screen.findByText(/Rent 2026-10/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Total Spent Across All Categories/ }),
    ).toHaveTextContent('$15.5 (CAD) / $970 (USD)');
    expect(api.callsTo('reports/monthly').map((url) => url.search)).toEqual(['?yearMonth=2026-10']);
    expect(api.unhandled).toEqual([]);
  });

  it('fetches only the month you click, and keeps it selected', async () => {
    const api = installFakeApi(routes(['2026-10', '2026-09', '2025-12']));
    renderWithStore(<MonthlyReportsPage />);
    await screen.findByText(/Rent 2026-10/);

    fireEvent.click(screen.getByRole('button', { name: 'September' }));

    expect(await screen.findByText(/Rent 2026-09/)).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByRole('button', { name: 'September' }).className).toMatch(/active/);
    expect(api.callsTo('reports/monthly').map((url) => url.search)).toEqual([
      '?yearMonth=2026-10',
      '?yearMonth=2026-09',
    ]);
  });

  it('switches year and lands on that year’s latest month', async () => {
    installFakeApi(routes(['2026-10', '2025-12', '2025-03']));
    renderWithStore(<MonthlyReportsPage />);
    await screen.findByText(/Rent 2026-10/);

    fireEvent.click(screen.getByRole('button', { name: '2025' }));

    expect(await screen.findByText(/Rent 2025-12/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'March' })).toBeInTheDocument();
  });

  it('keeps the current month reachable even when it has no expenses yet', async () => {
    const api = installFakeApi({
      ...routes([]),
      'reports/monthly': (url) => ({
        yearMonth: url.searchParams.get('yearMonth'),
        totalSpentCad: 0,
        totalSpentUsd: 0,
        dataByCategory: [],
      }),
    });

    renderWithStore(<MonthlyReportsPage />);

    expect(await screen.findByRole('button', { name: '2026' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'October' })).toBeInTheDocument();
    await waitFor(() =>
      expect(api.callsTo('reports/monthly').map((url) => url.search)).toEqual([
        '?yearMonth=2026-10',
      ]),
    );
    expect(
      screen.getByRole('heading', { name: /Total Spent Across All Categories/ }),
    ).toHaveTextContent('$0 (CAD) / $0 (USD)');
  });

  it('refetches when the page is opened again, so edits made elsewhere show up', async () => {
    // Regression: these queries live in their own API slice, so expense edits do
    // not invalidate them; reopening within a minute showed the pre-edit totals.
    let rent = 900;
    const api = installFakeApi(routes(['2026-10'], () => rent));
    const first = renderWithStore(<MonthlyReportsPage />);
    // The heading shows $0 until the data arrives, so wait for the real figure.
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /Total Spent/ })).toHaveTextContent('$970 (USD)'),
    );
    first.unmount();

    rent = 1200;
    renderWithStore(<MonthlyReportsPage />, { store: first.store });

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /Total Spent/ })).toHaveTextContent(
        '$1,270 (USD)',
      ),
    );
    expect(api.callsTo('reports/monthly')).toHaveLength(2);
    expect(api.callsTo('reports/months')).toHaveLength(2);
  });
});
