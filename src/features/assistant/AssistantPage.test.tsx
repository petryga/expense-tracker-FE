// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { AssistantPage } from './AssistantPage';
import { renderWithStore } from '../../test/renderWithStore';

// The real store and RTK Query; only the network is faked. Invented data.
const fakeServer = (
  enabled: boolean,
  answer: (body: { question: string; history: unknown[] }) => { status: number; body: unknown },
) => {
  const asked: { question: string; history: unknown[] }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: Request | string) => {
      const req = typeof input === 'string' ? new Request(input) : input;
      if (req.method === 'GET') return Response.json({ enabled });
      const body = await req.json();
      asked.push(body);
      const { status, body: out } = answer(body);
      return Response.json(out, { status });
    }),
  );
  return asked;
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// Waits for the page to know the assistant is on, then asks.
const askQuestion = async (text: string) => {
  fireEvent.change(await screen.findByLabelText('Your question'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
};

describe('AssistantPage', () => {
  it('shows the answer and the tools used, and sends earlier turns as history', async () => {
    const asked = fakeServer(true, ({ question }) => ({
      status: 200,
      body: {
        answer: question.includes('September')
          ? 'US$5.75 in September 2026.'
          : 'US$11.15 on coffee in October 2026.',
        outcome: 'answered',
        toolCalls: ['spending_report', 'spending_report'],
      },
    }));
    renderWithStore(<AssistantPage />);

    await askQuestion('Coffee in October?');
    expect(await screen.findByText('US$11.15 on coffee in October 2026.')).toBeInTheDocument();
    expect(screen.getByText('Looked at: spending report')).toBeInTheDocument();

    await askQuestion('And September?');
    expect(await screen.findByText('US$5.75 in September 2026.')).toBeInTheDocument();
    expect(asked[1]).toEqual({
      question: 'And September?',
      history: [
        { role: 'user', text: 'Coffee in October?' },
        { role: 'assistant', text: 'US$11.15 on coffee in October 2026.' },
      ],
    });
  });

  it('asks an example question with one click', async () => {
    const asked = fakeServer(true, () => ({
      status: 200,
      body: { answer: 'Groceries came first.', outcome: 'answered', toolCalls: [] },
    }));
    renderWithStore(<AssistantPage />);
    fireEvent.click(await screen.findByText('How much did I spend last month, by category?'));
    expect(await screen.findByText('Groceries came first.')).toBeInTheDocument();
    expect(asked[0].question).toBe('How much did I spend last month, by category?');
  });

  it('shows the daily limit, and a failure is never sent back as history', async () => {
    let call = 0;
    const asked = fakeServer(true, () =>
      call++ === 0
        ? { status: 429, body: { error: "That's 50 questions today. Try again tomorrow." } }
        : { status: 200, body: { answer: 'Fine.', outcome: 'answered', toolCalls: [] } },
    );
    renderWithStore(<AssistantPage />);
    await askQuestion('Coffee?');
    expect(
      await screen.findByText("That's 50 questions today. Try again tomorrow."),
    ).toBeInTheDocument();
    await askQuestion('Again?');
    await screen.findByText('Fine.');
    expect(asked[1].history).toEqual([{ role: 'user', text: 'Coffee?' }]);
  });

  it('explains when the assistant is off, with no way to ask', async () => {
    fakeServer(false, () => ({ status: 500, body: {} }));
    renderWithStore(<AssistantPage />);
    expect(await screen.findByRole('status')).toHaveTextContent('turned off');
    expect(screen.queryByLabelText('Your question')).not.toBeInTheDocument();
  });
});
