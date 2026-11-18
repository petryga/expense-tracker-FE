import { describe, expect, it } from 'vitest';
import { isAssistantEnabled } from './enabled';

describe('isAssistantEnabled', () => {
  it('is on in the dev server', () => {
    expect(isAssistantEnabled({ DEV: true })).toBe(true);
  });

  it('is off in a production build unless asked for', () => {
    expect(isAssistantEnabled({ DEV: false })).toBe(false);
    expect(isAssistantEnabled({ DEV: false, VITE_ASSISTANT_ENABLED: 'false' })).toBe(false);
    expect(isAssistantEnabled({ DEV: false, VITE_ASSISTANT_ENABLED: 'true' })).toBe(true);
  });
});
