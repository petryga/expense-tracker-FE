import { describe, expect, it } from 'vitest';
import sidebarReducer, { initialState, toggleSidebar } from './sidebarSlice';

describe('sidebarSlice reducer', () => {
  it('defaults to not visible', () => {
    expect(initialState).toEqual({ isVisible: false });
  });

  it('toggles isVisible on', () => {
    const state = sidebarReducer(initialState, toggleSidebar());
    expect(state).toEqual({ isVisible: true });
  });

  it('toggles isVisible back off', () => {
    const state = sidebarReducer({ isVisible: true }, toggleSidebar());
    expect(state).toEqual({ isVisible: false });
  });

  it('returns the initial state for an unknown action', () => {
    const state = sidebarReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ isVisible: false });
  });
});
