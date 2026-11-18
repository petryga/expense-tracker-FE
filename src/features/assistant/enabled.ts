// The assistant is local-only by design: the backend refuses it in production.
// So the Ask page exists in the dev server, and in a build only when
// VITE_ASSISTANT_ENABLED=true; production builds show no entry for it.
export const isAssistantEnabled = (env: { DEV: boolean; VITE_ASSISTANT_ENABLED?: string }) =>
  env.DEV || env.VITE_ASSISTANT_ENABLED === 'true';

export const assistantEnabled = isAssistantEnabled(import.meta.env);
