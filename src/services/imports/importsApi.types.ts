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
}

export interface ImportList {
  data: ImportSummary[];
  // Local use: true. Public demo: false; the demo account gets the sample instead.
  uploadAllowed: boolean;
  sampleAvailable: boolean;
}

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
