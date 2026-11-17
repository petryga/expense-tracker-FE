import type { ChatTurn } from '../../services/assistant/assistantApi';

export interface Message extends ChatTurn {
  id: number;
  // Tools the assistant used for this answer.
  toolCalls?: string[];
  // A failure shown in the conversation; never sent back as history.
  failed?: boolean;
}

// The server takes at most this many earlier turns.
export const MAX_HISTORY = 20;

// Earlier turns to send with a new question: answered exchanges only, newest kept.
export const historyFor = (messages: Message[]): ChatTurn[] =>
  messages
    .filter((m) => !m.failed)
    .map(({ role, text }) => ({ role, text }))
    .slice(-MAX_HISTORY);

// "spending_report" -> "spending report"; each tool once, in first-used order.
export const toolsUsed = (toolCalls: string[] = []) =>
  [...new Set(toolCalls)].map((name) => name.replace(/_/g, ' '));

export const errorText = (status: number | string | undefined, serverMessage?: string) => {
  if (status === 429 && serverMessage) return serverMessage;
  if (status === 403) return 'The assistant is not available for this account.';
  return 'The assistant is unavailable right now. Try again in a moment.';
};

export const EXAMPLES = [
  'How much did I spend last month, by category?',
  'How did my grocery spending change over the last three months?',
  'What are my recurring bills and what do they add up to?',
];
