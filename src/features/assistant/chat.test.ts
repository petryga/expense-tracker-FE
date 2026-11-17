import { describe, expect, it } from 'vitest';
import { MAX_HISTORY, errorText, historyFor, toolsUsed, type Message } from './chat';

describe('historyFor', () => {
  it('sends answered turns only, newest kept, without display fields', () => {
    const messages: Message[] = [
      { id: 1, role: 'user', text: 'Coffee in October?' },
      { id: 2, role: 'assistant', text: 'US$11.15.', toolCalls: ['spending_report'] },
      { id: 3, role: 'user', text: 'And September?' },
      { id: 4, role: 'assistant', text: 'Unavailable.', failed: true },
    ];
    expect(historyFor(messages)).toEqual([
      { role: 'user', text: 'Coffee in October?' },
      { role: 'assistant', text: 'US$11.15.' },
      { role: 'user', text: 'And September?' },
    ]);
    const many = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      role: 'user' as const,
      text: `q${i}`,
    }));
    expect(historyFor(many)).toHaveLength(MAX_HISTORY);
    expect(historyFor(many)[MAX_HISTORY - 1]).toEqual({ role: 'user', text: 'q29' });
  });
});

describe('toolsUsed', () => {
  it('names each tool once, readably', () => {
    expect(toolsUsed(['spending_report', 'monthly_summary', 'spending_report'])).toEqual([
      'spending report',
      'monthly summary',
    ]);
    expect(toolsUsed()).toEqual([]);
  });
});

describe('errorText', () => {
  it('shows the daily-limit message, and a plain one otherwise', () => {
    expect(errorText(429, "That's 50 questions today.")).toBe("That's 50 questions today.");
    expect(errorText(403)).toMatch(/not available/);
    expect(errorText(503, 'internal detail')).toMatch(/unavailable right now/);
    expect(errorText('FETCH_ERROR')).toMatch(/unavailable right now/);
  });
});
