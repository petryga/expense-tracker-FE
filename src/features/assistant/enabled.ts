// The Ask page exists in the dev server, and in a build only when
// VITE_ASSISTANT_ENABLED=true, so a deploy shows it only once the backend and
// the AI service are set up for it. The backend still decides who may ask.
export const isAssistantEnabled = (env: { DEV: boolean; VITE_ASSISTANT_ENABLED?: string }) =>
  env.DEV || env.VITE_ASSISTANT_ENABLED === 'true';

export const assistantEnabled = isAssistantEnabled(import.meta.env);
