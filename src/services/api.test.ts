import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

describe('getApiUrl', () => {
  it('prefixes a path with no leading slash', async () => {
    const { getApiUrl } = await import('./api');
    expect(getApiUrl('expenses')).toBe('http://localhost:3000/expenses');
  });

  it('does not double up a leading slash', async () => {
    const { getApiUrl } = await import('./api');
    expect(getApiUrl('/expenses')).toBe('http://localhost:3000/expenses');
  });
});

// getAuthHeader's behavior is the concrete FE difference between "local"
// (no Supabase configured, isAuthEnabled=false) and "prod" (a real Supabase
// project, isAuthEnabled=true): mocking lib/supabaseClient per test lets us
// exercise both without needing a real session or network call.
describe('getAuthHeader (local vs prod behavior)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock('../lib/supabaseClient');
  });

  it('returns no headers and never touches supabase in local no-auth mode', async () => {
    const getSession = vi.fn();
    vi.doMock('../lib/supabaseClient', () => ({
      isAuthEnabled: false,
      supabase: { auth: { getSession } },
    }));

    const { getAuthHeader } = await import('./api');
    const headers = await getAuthHeader();

    expect(headers).toEqual({});
    expect(getSession).not.toHaveBeenCalled();
  });

  it('attaches a Bearer token from the current session in prod (auth-enabled) mode', async () => {
    const getSession = vi.fn().mockResolvedValue({ data: { session: { access_token: 'tok-123' } } });
    vi.doMock('../lib/supabaseClient', () => ({
      isAuthEnabled: true,
      supabase: { auth: { getSession } },
    }));

    const { getAuthHeader } = await import('./api');
    const headers = await getAuthHeader();

    expect(headers).toEqual({ Authorization: 'Bearer tok-123' });
  });

  it('returns no Authorization header in prod mode when there is no active session', async () => {
    const getSession = vi.fn().mockResolvedValue({ data: { session: null } });
    vi.doMock('../lib/supabaseClient', () => ({
      isAuthEnabled: true,
      supabase: { auth: { getSession } },
    }));

    const { getAuthHeader } = await import('./api');
    const headers = await getAuthHeader();

    expect(headers).toEqual({});
  });
});
