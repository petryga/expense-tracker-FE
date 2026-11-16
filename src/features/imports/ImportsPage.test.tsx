// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { ImportsPage } from './ImportsPage';
import { installFakeApi } from '../../test/fakeApi';
import { renderWithStore } from '../../test/renderWithStore';
import type { ImportDetail, ImportRow } from '../../services/imports/importsApi.types';

const ID = '11111111-1111-4111-8111-111111111111';

const row = (overrides: Partial<ImportRow>): ImportRow => ({
  id: 'row',
  postedDate: '2026-10-01',
  description: 'DESC',
  suggestedDescription: 'desc',
  amountCents: 1000,
  kind: 'charge',
  status: 'draft',
  category: null,
  expenseId: null,
  amexCategory: null,
  matched: null,
  ...overrides,
});

const detail = (rows: ImportRow[]): ImportDetail => ({
  id: ID,
  source: 'amex',
  fileName: 'activity.csv',
  account: 'Amex',
  currency: 'USD',
  createdAt: '2026-11-15T12:00:00Z',
  rowCount: rows.length,
  savedExpenseCount: 1,
  draftCount: rows.filter((r) => r.status === 'draft').length,
  byKind: {},
  byStatus: { returned: { count: 2, cents: 0 }, skipped: { count: 1, cents: -50000 } },
  reconciliation: {
    fileTotalCents: -48765,
    importedCount: rows.length,
    importedCents: -48765,
    duplicateCount: 0,
    duplicateTotalCents: 0,
    balanced: true,
  },
  rows,
});

const ROWS = [
  row({
    id: 'groceries',
    description: 'WHOLE FOODS MKT',
    suggestedDescription: 'whole foods mkt',
    amountCents: 8210,
  }),
  row({
    id: 'coffee',
    description: 'STARBUCKS 0123',
    suggestedDescription: 'starbucks 0123',
    amountCents: 525,
  }),
  row({ id: 'partial', description: 'LENSWORKS OPTICAL', kind: 'refund', amountCents: -2000 }),
  row({ id: 'skippedCharge', description: 'PARKING LOT 12', status: 'skipped', amountCents: 800 }),
  row({
    id: 'payment',
    description: 'AUTOPAY PAYMENT - THANK YOU',
    kind: 'payment',
    status: 'skipped',
    amountCents: -50000,
  }),
  row({
    id: 'bought',
    description: 'AMAZON.COM*AB12C',
    status: 'returned',
    amountCents: 2499,
    matched: {
      id: 'refunded',
      batchId: 'other',
      postedDate: '2026-10-03',
      description: 'AMAZON MARKEPLACE',
      amountCents: -2499,
      status: 'returned',
      expenseId: null,
    },
  }),
];

const render = (api = installFakeApi({}), uploadAllowed = true, query = '') => {
  api.setRoute('imports', () => ({
    data: [detail(ROWS)],
    uploadAllowed,
    sampleAvailable: !uploadAllowed,
  }));
  api.setRoute(`imports/${ID}`, () => detail(ROWS));
  api.setRoute('categories', () => [
    { id: 'f', name: 'Food & Dining', parentCategoryId: null, isDefault: true, budget: null },
    { id: 'g', name: 'Groceries', parentCategoryId: 'f', isDefault: true, budget: null },
  ]);
  api.setRoute('accounts', () => [{ id: 'a', name: 'Amex', currency: 'USD', isDefault: true }]);
  renderWithStore(
    <Routes>
      <Route path="/imports/:importId?" element={<ImportsPage />} />
    </Routes>,
    { route: `/imports/${ID}${query}` },
  );
  return api;
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ImportsPage review', () => {
  it('shows drafts for review, and keeps returned pairs and payments out of the review grid', async () => {
    const api = render();
    const grid = await screen.findByRole('grid', { name: 'Rows to review' });
    expect(within(grid).getByDisplayValue('whole foods mkt')).toBeInTheDocument();
    expect(within(grid).queryByText(/AMAZON.COM\*AB12C/)).not.toBeInTheDocument();
    expect(within(grid).getByText(/Refund with no matching purchase/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Returned (1)' })).toBeInTheDocument();
    expect(screen.getByText(/Reconciled with the file/)).toBeInTheDocument();
    expect(api.unhandled).toEqual([]);
  });

  it('confirms only decided rows: categorised saves and skips', async () => {
    const api = render();
    api.setRoute(`imports/${ID}/confirm`, () => ({
      saved: 1,
      skipped: 2,
      returned: 0,
      import: detail(ROWS),
    }));
    await screen.findByRole('grid', { name: 'Rows to review' });

    // The partial refund defaults to skip; nothing has a category yet.
    expect(screen.getByRole('button', { name: 'Confirm 1 rows' })).toBeEnabled();

    // Skip the coffee instead of saving it.
    fireEvent.click(screen.getByRole('button', { name: 'skip starbucks 0123' }));
    expect(screen.getByRole('button', { name: 'Confirm 2 rows' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm 2 rows' }));
    await waitFor(() => expect(api.callsTo(`imports/${ID}/confirm`)).toHaveLength(1));

    const confirmCall = vi
      .mocked(fetch)
      .mock.calls.find(([input]) => String((input as Request).url ?? input).endsWith('/confirm'));
    const body = await (confirmCall![0] as Request).json();
    expect(body).toEqual({
      rows: [
        { id: 'coffee', action: 'skip' },
        { id: 'partial', action: 'skip' },
      ],
    });
    expect(await screen.findByText('Saved 1, skipped 2, returned 0.')).toBeInTheDocument();
  });

  it('every row is editable at once, and one confirm saves them all', async () => {
    const api = render();
    api.setRoute(`imports/${ID}/confirm`, () => ({
      saved: 2,
      skipped: 1,
      returned: 0,
      import: detail(ROWS),
    }));
    await screen.findByRole('grid', { name: 'Rows to review' });

    const pick = async (bankText: string, option: string) => {
      fireEvent.mouseDown(screen.getByRole('combobox', { name: `Category for ${bankText}` }));
      fireEvent.click(await screen.findByRole('option', { name: option }));
    };
    await pick('WHOLE FOODS MKT', 'Food & Dining - Groceries');
    await pick('STARBUCKS 0123', 'Food & Dining - Groceries');
    fireEvent.change(screen.getByRole('textbox', { name: 'Description for STARBUCKS 0123' }), {
      target: { value: 'coffee' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm 3 rows' }));
    await waitFor(() => expect(api.callsTo(`imports/${ID}/confirm`)).toHaveLength(1));
    const confirmCall = vi
      .mocked(fetch)
      .mock.calls.find(([input]) => String((input as Request).url ?? input).endsWith('/confirm'));
    expect((await (confirmCall![0] as Request).json()).rows).toEqual([
      { id: 'groceries', action: 'save', category: 'Groceries', description: 'whole foods mkt' },
      { id: 'coffee', action: 'save', category: 'Groceries', description: 'coffee' },
      { id: 'partial', action: 'skip' },
    ]);
  });

  it.each([
    ['Keep expenses', `/imports/${ID}?keepExpenses=true`],
    ['Delete expenses too', `/imports/${ID}`],
  ])('deleting an import offers to keep its expenses: %s', async (choice, path) => {
    render();
    await screen.findByRole('grid', { name: 'Rows to review' });

    fireEvent.click(screen.getByRole('button', { name: 'Delete import' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('1 expense saved from it is still on the Expenses page');
    fireEvent.click(within(dialog).getByRole('button', { name: choice }));

    const deleteCall = await waitFor(() => {
      const call = vi
        .mocked(fetch)
        .mock.calls.find(([input]) => (input as Request).method === 'DELETE');
      expect(call).toBeDefined();
      return call!;
    });
    expect(
      new URL((deleteCall[0] as Request).url).pathname +
        new URL((deleteCall[0] as Request).url).search,
    ).toBe(path);
  });

  it('uploads as soon as a file is chosen, with the selected currency', async () => {
    render();
    await screen.findByRole('region', { name: 'Upload a statement' });
    fireEvent.click(screen.getByRole('button', { name: 'CAD' }));

    const file = new File(['Date,Description,Amount,Reference\n'], 'october.csv', {
      type: 'text/csv',
    });
    fireEvent.change(screen.getByLabelText('Statement file'), { target: { files: [file] } });

    const post = await waitFor(() => {
      const call = vi
        .mocked(fetch)
        .mock.calls.find(
          ([input]) =>
            (input as Request).method === 'POST' && (input as Request).url.endsWith('/imports'),
        );
      expect(call).toBeDefined();
      return call!;
    });
    expect(await (post[0] as Request).json()).toEqual({
      fileName: 'october.csv',
      csv: 'Date,Description,Amount,Reference\n',
      account: 'Amex',
      currency: 'CAD',
    });
  });

  it('puts the checked skipped rows back into review with one button', async () => {
    const api = render(installFakeApi({}), true, '?tab=skipped');
    api.setRoute(`imports/${ID}/reopen`, () => ({ reopened: 2, import: detail(ROWS) }));
    const grid = await screen.findByRole('grid', { name: 'Skipped' });
    const button = screen.getByRole('button', { name: 'Review again' });
    expect(button).toBeDisabled();

    const checkboxes = within(grid).getAllByRole('checkbox', { name: 'Select row' });
    checkboxes.forEach((box) => fireEvent.click(box));
    fireEvent.click(screen.getByRole('button', { name: 'Review again (2)' }));

    const post = await waitFor(() => {
      const call = vi
        .mocked(fetch)
        .mock.calls.find(([input]) => (input as Request).url.endsWith('/reopen'));
      expect(call).toBeDefined();
      return call!;
    });
    expect(await (post[0] as Request).json()).toEqual({ rowIds: ['skippedCharge', 'payment'] });
  });

  it('shows the file upload locally, and only the sample button to the demo account', async () => {
    render();
    expect(await screen.findByRole('region', { name: 'Upload a statement' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Import sample statement' }),
    ).not.toBeInTheDocument();
    cleanup();

    render(installFakeApi({}), false);
    expect(
      await screen.findByRole('button', { name: 'Import sample statement' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Upload a statement' })).not.toBeInTheDocument();
  });
});
