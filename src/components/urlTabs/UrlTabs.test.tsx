// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UrlTabs } from './UrlTabs';

afterEach(cleanup);

const sections = [
  { id: 'a', label: 'Section A', content: <div>Content A</div> },
  { id: 'b', label: 'Section B', content: <div>Content B</div> },
  { id: 'c', label: 'Section C', content: <div>Content C</div> },
];

const renderWithRouter = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <UrlTabs sections={sections} />
    </MemoryRouter>,
  );

describe('UrlTabs', () => {
  it('defaults to the first section when there is no ?tab= param', () => {
    renderWithRouter('/settings');

    expect(screen.getByText('Content A')).toBeInTheDocument();
    expect(screen.queryByText('Content B')).not.toBeInTheDocument();
    expect(screen.queryByText('Content C')).not.toBeInTheDocument();
  });

  it('renders only the section named by ?tab=, not the others', () => {
    renderWithRouter('/settings?tab=c');

    expect(screen.getByText('Content C')).toBeInTheDocument();
    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
    expect(screen.queryByText('Content B')).not.toBeInTheDocument();
  });

  it('falls back to the first section for an unknown ?tab= value', () => {
    renderWithRouter('/settings?tab=nonexistent');

    expect(screen.getByText('Content A')).toBeInTheDocument();
    expect(screen.queryByText('Content B')).not.toBeInTheDocument();
  });

  it('renders a link per section pointing at the right query string', () => {
    renderWithRouter('/settings');

    expect(screen.getByRole('link', { name: 'Section A' })).toHaveAttribute(
      'href',
      '/settings?tab=a',
    );
    expect(screen.getByRole('link', { name: 'Section B' })).toHaveAttribute(
      'href',
      '/settings?tab=b',
    );
    expect(screen.getByRole('link', { name: 'Section C' })).toHaveAttribute(
      'href',
      '/settings?tab=c',
    );
  });

  it('marks only the active tab link with aria-current', () => {
    renderWithRouter('/settings?tab=b');

    expect(screen.getByRole('link', { name: 'Section A' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Section B' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Section C' })).not.toHaveAttribute('aria-current');
  });
});
