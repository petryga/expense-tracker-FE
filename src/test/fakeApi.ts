import { vi } from 'vitest';

type Handler = (url: URL) => unknown;

// Stands in for the network. Everything above `fetch` - RTK Query, the store,
// the hooks, the components - is the real thing, so a test sees exactly the
// requests the app would send and renders whatever the "server" answers.
//
// Routes are matched on the path (e.g. 'reports/flow'); a handler gets the full
// URL so it can read query params. Anything unmatched fails the request AND is
// recorded in `unhandled`, so a page quietly calling something the test did not
// expect shows up as a failure rather than a mystery.
export const installFakeApi = (routes: Record<string, Handler>) => {
  const calls: URL[] = [];
  const unhandled: string[] = [];

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: Request | string | URL) => {
      const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
      const path = url.pathname.replace(/^\//, '');
      calls.push(url);

      const handler = routes[path];
      if (!handler) {
        unhandled.push(`${url.pathname}${url.search}`);
        return new Response(JSON.stringify({ error: 'not stubbed' }), { status: 404 });
      }
      return new Response(JSON.stringify(handler(url)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  );

  return {
    calls,
    unhandled,
    // Requests whose path matches, e.g. callsTo('reports/flow').map((u) => u.search)
    callsTo: (path: string) => calls.filter((url) => url.pathname === `/${path}`),
    setRoute: (path: string, handler: Handler) => {
      routes[path] = handler;
    },
  };
};
