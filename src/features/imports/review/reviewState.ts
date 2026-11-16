import type {
  ConfirmAction,
  ConfirmDecision,
  ImportItem,
  ImportRow,
} from '../../../services/imports/importsApi.types';

export interface RowChoice {
  action: ConfirmAction;
  category: string;
  description: string;
  // Bought as a gift: saved with its real category plus the gift flag.
  isGift: boolean;
}

// A refund paired with a purchase that is already an expense: confirming
// "return" removes that expense. A refund without a pair can't be traced to a
// purchase (partial refund, or the purchase is in a file not uploaded yet).
export const returnsSavedPurchase = (row: ImportRow) =>
  row.kind === 'refund' && (!!row.matched || !!row.matchedItem);

// A suggestion pre-fills the category; you confirm it or pick another.
export const defaultChoice = (row: ImportRow): RowChoice => ({
  action: returnsSavedPurchase(row) ? 'return' : row.kind === 'refund' ? 'skip' : 'save',
  category: row.category ?? row.suggestedCategory ?? '',
  description: row.suggestedDescription,
  isGift: false,
});

// An Amazon charge split into its items: each item is reviewed on its own.
// Items returned on their own (refunded) are left out.
export const splitItems = (row: ImportRow): ImportItem[] =>
  row.amazonStatus === 'matched' ? (row.items ?? []).filter((i) => i.status !== 'returned') : [];

export const returnedItems = (row: ImportRow): ImportItem[] =>
  (row.items ?? []).filter((i) => i.status === 'returned');

export const defaultItemChoice = (item: ImportItem): RowChoice => ({
  action: 'save',
  category: item.category ?? item.suggestedCategory ?? '',
  description: item.suggestedDescription,
  isGift: false,
});

type Suggested = Pick<ImportRow, 'suggestedCategory' | 'suggestionSource' | 'suggestionStatus'>;

// Shown under the category while it is still the suggestion.
export const suggestionNote = (row: Suggested, category: string): string | null => {
  if (row.suggestionStatus === 'pending' && !category) return 'Getting a suggestion…';
  if (!row.suggestedCategory || category !== row.suggestedCategory) return null;
  return row.suggestionSource === 'memory' ? 'Suggested: you chose this before' : 'Suggested by AI';
};

export const pendingCount = (rows: ImportRow[]) =>
  rows
    .filter((row) => row.status === 'draft')
    .reduce(
      (count, row) =>
        count +
        (row.suggestionStatus === 'pending' ? 1 : 0) +
        (row.items ?? []).filter((item) => item.suggestionStatus === 'pending').length,
      0,
    );

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
      const items = splitItems(row);
      if (choice.action === 'save' && items.length) {
        const itemChoices = items.map((item) => ({
          item,
          choice: choices[item.id] ?? defaultItemChoice(item),
        }));
        // Saved together, so it waits until every item has a category.
        if (itemChoices.some(({ choice: c }) => !c.category)) return [];
        return [
          {
            id: row.id,
            action: 'save',
            items: itemChoices.map(({ item, choice: c }) => ({
              id: item.id,
              category: c.category,
              description: c.description.trim() || item.suggestedDescription,
              ...(c.isGift ? { isGift: true } : {}),
            })),
          },
        ];
      }
      if (choice.action === 'save') {
        if (!choice.category) return [];
        return [
          {
            id: row.id,
            action: 'save',
            category: choice.category,
            description: choice.description.trim() || row.suggestedDescription,
            ...(choice.isGift ? { isGift: true } : {}),
          },
        ];
      }
      return [{ id: row.id, action: choice.action }];
    });

export const formatCents = (cents: number) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
