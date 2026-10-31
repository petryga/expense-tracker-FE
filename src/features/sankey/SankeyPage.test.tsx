// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { SankeyPage } from './SankeyPage';
import { installFakeApi } from '../../test/fakeApi';
import { renderWithStore } from '../../test/renderWithStore';

// Nivo measures its container, which jsdom cannot; the page's own logic is what is
// under test, so the chart is reduced to a list of the node names it was given.
vi.mock('@nivo/sankey', () => ({
  ResponsiveSankey: ({ data }: { data: { nodes: { id: string; name: string }[] } }) => (
    <ul data-testid="sankey">
      {data.nodes.map((node) => (
        <li key={node.id}>{node.name}</li>
      ))}
    </ul>
  ),
}));

const MONTHS = ['2026-03', '2026-04', '2026-05'];

// What the BE answers: the requested month if it is comparable, else the latest.
const flowReport = (url: URL) => {
  const requested = url.searchParams.get('month');
  const month = requested && MONTHS.includes(requested) ? requested : MONTHS[MONTHS.length - 1];
  return {
    availableMonths: MONTHS,
    activeMonth: month,
    incomeAmount: 1000,
    expenseTotal: 800,
    savings: 200,
    cashSavings: 200,
    investmentGrowth: 0,
    categories: [{ category: `Rent ${month}`, value: 800 }],
  };
};

const monthSelect = () => screen.getByLabelText('Month') as HTMLSelectElement;
const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

beforeEach(() => {
  vi.unstubAllGlobals();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('SankeyPage', () => {
  it('shows the latest comparable month after a single request', async () => {
    const api = installFakeApi({ 'reports/flow': flowReport });

    renderWithStore(<SankeyPage />);

    await waitFor(() => expect(monthSelect().value).toBe('2026-05'));
    expect(await screen.findByText('Rent 2026-05 • $800')).toBeInTheDocument();
    await settle();
    expect(api.callsTo('reports/flow')).toHaveLength(1);
    expect(api.callsTo('reports/flow')[0].search).toBe('');
    expect(api.unhandled).toEqual([]);
  });

  it('switches to the month you pick and stays there', async () => {
    // Regression: while the new month was loading the page still held the old
    // report, saw "active month != selected month" and flipped the dropdown back,
    // so the month could never be changed.
    const api = installFakeApi({ 'reports/flow': flowReport });
    renderWithStore(<SankeyPage />);
    await waitFor(() => expect(monthSelect().value).toBe('2026-05'));

    fireEvent.change(monthSelect(), { target: { value: '2026-03' } });

    expect(await screen.findByText('Rent 2026-03 • $800')).toBeInTheDocument();
    await settle();
    expect(monthSelect().value).toBe('2026-03');
    expect(screen.queryByText('Rent 2026-05 • $800')).not.toBeInTheDocument();
    expect(api.callsTo('reports/flow').map((url) => url.search)).toEqual(['', '?month=2026-03']);
  });

  it('can move between several months and back to the latest', async () => {
    installFakeApi({ 'reports/flow': flowReport });
    renderWithStore(<SankeyPage />);
    await waitFor(() => expect(monthSelect().value).toBe('2026-05'));

    for (const month of ['2026-04', '2026-03', '2026-05']) {
      fireEvent.change(monthSelect(), { target: { value: month } });
      expect(await screen.findByText(`Rent ${month} • $800`)).toBeInTheDocument();
      await settle();
      expect(monthSelect().value).toBe(month);
    }
  });

  it('shows the BE month when the chosen one is not comparable', async () => {
    installFakeApi({
      'reports/flow': (url) =>
        url.searchParams.get('month')
          ? { ...flowReport(new URL('http://x/?month=2026-04')), activeMonth: '2026-05' }
          : flowReport(url),
    });
    renderWithStore(<SankeyPage />);
    await waitFor(() => expect(monthSelect().value).toBe('2026-05'));

    fireEvent.change(monthSelect(), { target: { value: '2026-04' } });

    await waitFor(() => expect(monthSelect().value).toBe('2026-05'));
  });

  it('refetches when the page is opened again, so edits made elsewhere show up', async () => {
    // Regression: moving this page's data to its own API slice meant expense and
    // income edits no longer refreshed it, so reopening it within a minute showed
    // the numbers from before the edit.
    let rent = 800;
    const api = installFakeApi({
      'reports/flow': (url) => ({
        ...flowReport(url),
        categories: [{ category: 'Rent', value: rent }],
      }),
    });
    const first = renderWithStore(<SankeyPage />);
    expect(await screen.findByText('Rent • $800')).toBeInTheDocument();
    first.unmount();

    rent = 950;
    renderWithStore(<SankeyPage />, { store: first.store });

    expect(await screen.findByText('Rent • $950')).toBeInTheDocument();
    expect(api.callsTo('reports/flow')).toHaveLength(2);
  });

  it('explains when there is not enough data', async () => {
    installFakeApi({
      'reports/flow': () => ({
        availableMonths: [],
        activeMonth: null,
        incomeAmount: 0,
        expenseTotal: 0,
        savings: 0,
        cashSavings: 0,
        investmentGrowth: 0,
        categories: [],
      }),
    });

    renderWithStore(<SankeyPage />);

    expect(await screen.findByText(/We need more data/)).toBeInTheDocument();
  });
});
