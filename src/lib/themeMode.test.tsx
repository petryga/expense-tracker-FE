// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ThemeModeProvider, useThemeMode } from './themeMode';

const Probe = () => {
  const { mode, toggleMode } = useThemeMode();
  return <button onClick={toggleMode}>{mode}</button>;
};

afterEach(() => {
  cleanup();
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe('ThemeModeProvider', () => {
  it('uses the saved choice and applies it to <html>', () => {
    localStorage.setItem('theme-mode', 'dark');
    render(
      <ThemeModeProvider>
        <Probe />
      </ThemeModeProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('toggles, updates <html> and remembers the choice', () => {
    render(
      <ThemeModeProvider>
        <Probe />
      </ThemeModeProvider>,
    );
    const before = screen.getByRole('button').textContent;
    fireEvent.click(screen.getByRole('button'));
    const after = before === 'dark' ? 'light' : 'dark';
    expect(screen.getByRole('button')).toHaveTextContent(after);
    expect(document.documentElement.dataset.theme).toBe(after);
    expect(localStorage.getItem('theme-mode')).toBe(after);
  });
});
