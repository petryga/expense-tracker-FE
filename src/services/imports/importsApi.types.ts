export type TransactionKind = 'charge' | 'refund' | 'payment' | 'reward';
export type ImportStatus = 'draft' | 'saved' | 'skipped' | 'returned';
export type ConfirmAction = 'save' | 'skip' | 'return';

type Tally = Partial<Record<string, { count: number; cents: number }>>;

export interface ImportSummary {
  id: string;
  source: string;
  fileName: string;
  account: string;
  currency: 'CAD' | 'USD';
  createdAt: string;
  rowCount: number;
  draftCount: number;
  byKind: Tally;
  byStatus: Tally;
  reconciliation: {
    fileTotalCents: number;
    importedCount: number;
    importedCents: number;
    duplicateCount: number;
    duplicateTotalCents: number;
    balanced: boolean;
  };
}

// One item of a matched Amazon charge, saved as its own expense.
export interface ImportItem {
  id: string;
  description: string; // the product name
  suggestedDescription: string; // shortened, what the expense is called
  amountCents: number;
  quantity: number;
  category: string | null;
  expenseId: string | null;
  suggestedCategory: string | null;
  suggestionSource: 'memory' | 'model' | null;
  suggestionStatus: 'pending' | 'done' | 'none';
  // 'returned': a card refund gave this item back; it is not saved.
  status?: 'returned' | null;
}

// An order that could be what an Amazon charge paid for.
export interface AmazonCandidate {
  key: string;
  // Paid partly with a gift card: the charge is less than the items, and the
  // split is in proportion to their prices.
  partial?: boolean;
  orderDate: string | null;
  shipDate: string | null;
  items: { description: string; amountCents: number }[];
}

export interface ImportRow {
  id: string;
  postedDate: string;
  description: string;
  suggestedDescription: string;
  amountCents: number;
  kind: TransactionKind;
  status: ImportStatus;
  category: string | null;
  expenseId: string | null;
  amexCategory: string | null;
  // Where the suggested category came from: your past choices for this shop
  // ('memory') or the AI service ('model'). 'pending' while the AI works on it.
  suggestedCategory: string | null;
  suggestionSource: 'memory' | 'model' | null;
  suggestionStatus: 'pending' | 'done' | 'none';
  matched: {
    id: string;
    batchId: string;
    postedDate: string;
    description: string;
    amountCents: number;
    status: ImportStatus;
    expenseId: string | null;
  } | null;
  // Amazon charges: 'matched' = split into `items`; 'ambiguous' = several
  // orders fit (`amazonCandidates`); 'declined' = kept as one row.
  amazonStatus?: 'matched' | 'ambiguous' | 'declined' | null;
  items?: ImportItem[];
  amazonCandidates?: AmazonCandidate[];
  // A refund that returns one item of a split Amazon charge.
  matchedItem?: {
    id: string;
    description: string;
    amountCents: number;
    expenseId: string | null;
    chargePostedDate: string | null;
  } | null;
}

export interface ImportList {
  data: ImportSummary[];
  // Local use: true. Public demo: false; the demo account gets the sample instead.
  uploadAllowed: boolean;
  sampleAvailable: boolean;
  // The uploaded Amazon order history.
  amazon?: { itemCount: number; latestOrderDate: string | null; refundCount?: number };
}

// Either Amazon file: the order history or the refund list.
export type AmazonUploadResult =
  | { kind: 'orders'; itemCount: number; newItemCount: number; matchedCount: number }
  | { kind: 'refunds'; refundCount: number; newRefundCount: number; pairedCount: number };

export interface ImportDetail extends ImportSummary {
  // Expenses saved from this import that still exist; deleting the import removes them.
  savedExpenseCount: number;
  rows: ImportRow[];
}

// The whole file had been imported before: nothing new, no import created.
export interface UploadNothingNew {
  id: null;
  rowCount: number;
  duplicateCount: number;
}

export interface UploadArgs {
  fileName: string;
  csv: string;
  account: string;
  currency: 'CAD' | 'USD';
}

export interface ConfirmDecision {
  id: string;
  action: ConfirmAction;
  category?: string;
  description?: string;
  isGift?: boolean;
  // A split Amazon charge: every item, each with a category.
  items?: { id: string; category: string; description?: string; isGift?: boolean }[];
}

export interface ConfirmArgs {
  id: string;
  rows: ConfirmDecision[];
}

export interface ConfirmResult {
  saved: number;
  skipped: number;
  returned: number;
  import: ImportDetail;
}
