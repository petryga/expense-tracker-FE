// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { MarketplacesPanel } from './MarketplacesPanel';
import { renderWithStore } from '../../test/renderWithStore';

// The real store and RTK Query; only the network is faked. Invented data.
const fakeServer = () => {
  const list = [{ id: 'm1', name: 'eBay' }];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: Request | string) => {
      const req = typeof input === 'string' ? new Request(input) : input;
      if (req.method === 'GET') return Response.json(list);
      if (req.method === 'DELETE') {
        list.splice(0, list.length, ...list.filter((m) => !req.url.endsWith(`/${m.id}`)));
        return new Response(null, { status: 204 });
      }
      const { name } = await req.json();
      if (list.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
        return Response.json({ error: 'duplicate' }, { status: 409 });
      }
      const added = { id: `m${list.length + 1}`, name };
      list.push(added);
      return Response.json(added, { status: 201 });
    }),
  );
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const addName = (name: string) => {
  fireEvent.change(screen.getByLabelText('New marketplace'), { target: { value: name } });
  fireEvent.click(screen.getByRole('button', { name: 'Add marketplace' }));
};

describe('MarketplacesPanel', () => {
  it('adds a marketplace, says so on a duplicate, and removes one', async () => {
    fakeServer();
    renderWithStore(<MarketplacesPanel />);
    expect(await screen.findByText('eBay')).toBeInTheDocument();

    addName('Vinted');
    expect(await screen.findByText('Vinted')).toBeInTheDocument();

    addName('EBAY');
    expect(await screen.findByText('Already on the list.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove eBay' }));
    await vi.waitFor(() => expect(screen.queryByText('eBay')).not.toBeInTheDocument());
  });
});
