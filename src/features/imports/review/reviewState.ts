import type {
  ConfirmAction,
  ConfirmDecision,
  ImportRow,
} from '../../../services/imports/importsApi.types';

export interface RowChoice {
  action: ConfirmAction;
  category: string;
  description: string;
}

// A refund paired with a purchase that is already an expense: confirming
// "return" removes that expense. A refund without a pair can't be traced to a
// purchase (partial refund, or the purchase is in a file not uploaded yet).
export const returnsSavedPurchase = (row: ImportRow) => row.kind === 'refund' && !!row.matched;

// A suggestion pre-fills the category; you confirm it or pick another.
export const defaultChoice = (row: ImportRow): RowChoice => ({
  action: returnsSavedPurchase(row) ? 'return' : row.kind === 'refund' ? 'skip' : 'save',
  category: row.category ?? row.suggestedCategory ?? '',
  description: row.suggestedDescription,
});

// Shown under the category while it is still the suggestion.
export const suggestionNote = (row: ImportRow, category: string): string | null => {
  if (row.suggestionStatus === 'pending' && !category) return 'Getting a suggestion…';
  if (!row.suggestedCategory || category !== row.suggestedCategory) return null;
  return row.suggestionSource === 'memory' ? 'Suggested: you chose this before' : 'Suggested by AI';
};

export const pendingCount = (rows: ImportRow[]) =>
  rows.filter((row) => row.status === 'draft' && row.suggestionStatus === 'pending').length;

export const actionsFor = (row: ImportRow): ConfirmAction[] =>
  returnsSavedPurchase(row) ? ['return', 'skip'] : ['save', 'skip'];

// Rows marked "save" without a category stay drafts, so a statement can be
// reviewed in several sittings.
export const buildDecisions = (
  rows: ImportRow[],
  choices: Record<string, RowChoice>,
): ConfirmDecision[] =>
  rows
    .filter((row) => row.status === 'draft')
    .flatMap((row): ConfirmDecision[] => {
      const choice = choices[row.id] ?? defaultChoice(row);
      if (choice.action === 'save') {
        if (!choice.category) return [];
        return [
          {
            id: row.id,
            action: 'save',
            category: choice.category,
            description: choice.description.trim() || row.suggestedDescription,
          },
        ];
      }
      return [{ id: row.id, action: choice.action }];
    });

export const formatCents = (cents: number) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
