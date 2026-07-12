import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

// createClient() builds a full realtime (WebSocket) client under the hood,
// which needs a WebSocket implementation Node doesn't provide out of the
// box. Mocked here since these tests are about supabaseClient.ts's own
// conditional-creation logic, not supabase-js's internals.
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ __mocked: true })),
}));

// isAuthEnabled/supabase are computed once at module load from
// import.meta.env, which is exactly how the app tells "prod" (a real
// Supabase project configured) apart from "local" (no config, auth off).
// Reimporting fresh with vi.resetModules() + vi.stubEnv() per test lets us
// exercise both states directly, matching how the app actually behaves in
// each environment rather than just asserting on the source code.
describe('supabaseClient (prod vs local behavior)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('enables auth and builds a real client when both Supabase env vars are set (prod/deployed mode)', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key-123');

    const { isAuthEnabled, supabase } = await import('./supabaseClient');

    expect(isAuthEnabled).toBe(true);
    expect(supabase).not.toBeNull();
  });

  it('disables auth and returns a null client when neither Supabase env var is set (local no-auth mode)', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const { isAuthEnabled, supabase } = await import('./supabaseClient');

    expect(isAuthEnabled).toBe(false);
    expect(supabase).toBeNull();
  });

  it('disables auth when only the URL is set (partial/misconfigured env)', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const { isAuthEnabled, supabase } = await import('./supabaseClient');

    expect(isAuthEnabled).toBe(false);
    expect(supabase).toBeNull();
  });

  it('disables auth when only the anon key is set (partial/misconfigured env)', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key-123');

    const { isAuthEnabled, supabase } = await import('./supabaseClient');

    expect(isAuthEnabled).toBe(false);
    expect(supabase).toBeNull();
  });
});
