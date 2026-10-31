// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { YearlyComparison } from './YearlyComparison';
import { installFakeApi } from '../../../test/fakeApi';
import { renderWithStore } from '../../../test/renderWithStore';

vi.mock('recharts', async () => (await import('../../../test/rechartsMock')).rechartsMock);

const OPTIONS = {
  ytdCutoffOptionsByYear: { 2025: [1, 2, 3, 12], 2026: [1, 2, 3, 10] },
  defaultYtdCutoffByYear: { 2025: 12, 2026: 10 },
};

// A stand-in BE: honours mode, base currency and cutoffs like the real endpoint.
const yearly = (url: URL) => {
  const mode = url.searchParams.get('mode');
  const base = url.searchParams.get('baseCurrency');
  const cutoffs = Object.fromEntries(
    (url.searchParams.get('cutoffs') ?? '')
      .split(',')
      .filter(Boolean)
      .map((pair) => pair.split(':')),
  );
  const row = (year: number, defaultCutoff: number) => {
    const chosen = cutoffs[year];
    const cutoff = chosen === 'none' ? null : Number(chosen ?? defaultCutoff);
    return { year, cutoff };
  };
  const rows = [row(2025, 12), row(2026, 10)]
    .filter(({ cutoff }) => mode !== 'ytd' || cutoff !== null)
    .map(({ year, cutoff }) => ({
      year,
      amountCad: 100,
      amountUsd: 50,
      convertedTotal: base === 'CAD' ? 1000 : 740,
      monthsCount: mode === 'ytd' ? cutoff : 12,
      cutoffMonth: mode === 'ytd' ? cutoff : null,
      annualized: base === 'CAD' ? 2000 : 1480,
      isIncomplete: false,
    }));
  return { rows, ...OPTIONS };
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const lastSearch = (api: ReturnType<typeof installFakeApi>) => {
  const calls = api.callsTo('reports/yearly-comparison');
  return calls[calls.length - 1].searchParams;
};

describe('YearlyComparison', () => {
  it('shows the BE rows and asks for a full-year comparison in USD by default', async () => {
    const api = installFakeApi({ 'reports/yearly-comparison': yearly });

    renderWithStore(<YearlyComparison />);

    const table = await screen.findByRole('table');
    expect(within(table).getByText('2025')).toBeInTheDocument();
    expect(within(table).getByText('2026')).toBeInTheDocument();
    expect(within(table).getAllByText('$740')).toHaveLength(2);
    const search = lastSearch(api);
    expect(search.get('mode')).toBe('full-year');
    expect(search.get('baseCurrency')).toBe('USD');
    expect(search.has('cutoffs')).toBe(false);
    expect(api.callsTo('reports/yearly-comparison')).toHaveLength(1);
    expect(api.unhandled).toEqual([]);
  });

  it('re-requests in the other base currency and relabels the columns', async () => {
    const api = installFakeApi({ 'reports/yearly-comparison': yearly });
    renderWithStore(<YearlyComparison />);
    await screen.findByRole('table');

    fireEvent.change(screen.getByLabelText('Base Currency'), { target: { value: 'CAD' } });

    expect(await screen.findByText('Converted Total (CAD)')).toBeInTheDocument();
    expect(lastSearch(api).get('baseCurrency')).toBe('CAD');
    expect(await screen.findAllByText('C$1,000')).toHaveLength(2);
  });

  it('settles after switching to YTD instead of refetching in a loop', async () => {
    const api = installFakeApi({ 'reports/yearly-comparison': yearly });
    renderWithStore(<YearlyComparison />);
    await screen.findByRole('table');

    fireEvent.change(screen.getByLabelText('Comparison'), { target: { value: 'ytd' } });

    expect(await screen.findByText('YTD cutoff month by year')).toBeInTheDocument();
    await waitFor(() => expect(lastSearch(api).get('cutoffs')).toBe('2025:12,2026:10'));
    const settledAt = api.callsTo('reports/yearly-comparison').length;
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(api.callsTo('reports/yearly-comparison')).toHaveLength(settledAt);
    expect(settledAt).toBeLessThanOrEqual(3);
  });

  it('sends the cutoff month you choose and can leave a year out', async () => {
    const api = installFakeApi({ 'reports/yearly-comparison': yearly });
    renderWithStore(<YearlyComparison />);
    await screen.findByRole('table');
    fireEvent.change(screen.getByLabelText('Comparison'), { target: { value: 'ytd' } });
    await screen.findByText('YTD cutoff month by year');
    await waitFor(() => expect(lastSearch(api).get('cutoffs')).toBe('2025:12,2026:10'));

    fireEvent.change(screen.getByLabelText('2026'), { target: { value: '3' } });
    await waitFor(() => expect(lastSearch(api).get('cutoffs')).toBe('2025:12,2026:3'));
    expect(await screen.findByText('3/3')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('2025'), { target: { value: '' } });
    await waitFor(() => expect(lastSearch(api).get('cutoffs')).toBe('2025:none,2026:3'));
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).queryByText('2025')).not.toBeInTheDocument();
      expect(within(table).getByText('2026')).toBeInTheDocument();
    });
  });

  it('shows an empty state when there are no expenses', async () => {
    installFakeApi({
      'reports/yearly-comparison': () => ({
        rows: [],
        ytdCutoffOptionsByYear: {},
        defaultYtdCutoffByYear: {},
      }),
    });

    renderWithStore(<YearlyComparison />);

    expect(await screen.findByText(/No yearly expense data/)).toBeInTheDocument();
  });

  it('refetches when the tab is opened again', async () => {
    let amount = 740;
    const api = installFakeApi({
      'reports/yearly-comparison': (url) => {
        const result = yearly(url);
        return { ...result, rows: result.rows.map((r) => ({ ...r, convertedTotal: amount })) };
      },
    });
    const first = renderWithStore(<YearlyComparison />);
    expect((await screen.findAllByText('$740')).length).toBeGreaterThan(0);
    first.unmount();

    amount = 810;
    renderWithStore(<YearlyComparison />, { store: first.store });

    expect((await screen.findAllByText('$810')).length).toBeGreaterThan(0);
    expect(api.callsTo('reports/yearly-comparison')).toHaveLength(2);
  });
});
