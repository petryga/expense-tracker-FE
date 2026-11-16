import { Button, Checkbox, MenuItem, TextField } from '@mui/material';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { ConfirmAction, ImportRow } from '../../../services/imports/importsApi.types';
import { formatDate } from '../../../utils';
import { Amount } from '../components';
import { actionsFor, returnsSavedPurchase, suggestionNote, type RowChoice } from './reviewState';
import styles from '../ImportsPage.module.css';

// `description` is what the expense will be called (editable); the bank's own
// text stays in `bankDescription`.
export type ReviewGridRow = ImportRow & RowChoice & { bankDescription: string };

// The grid uses arrow keys, space and enter for its own navigation; inside an
// input they belong to the input.
const stopGridKeys = (event: { stopPropagation: () => void }) => event.stopPropagation();

const rowNote = (row: ReviewGridRow) => {
  if (returnsSavedPurchase(row) && row.matched)
    return `Refund for the ${formatDate(row.matched.postedDate)} purchase already saved. Return removes that expense.`;
  if (row.kind === 'refund' && !row.matched)
    return 'Refund with no matching purchase: skip it, or save it as a negative expense.';
  return row.bankDescription;
};

// Every row is editable at once: description and category are plain inputs
// that write straight into the row's choice.
export const createReviewColumns = ({
  categoryOptions,
  setChoice,
}: {
  categoryOptions: { value: string; label: string }[];
  setChoice: (row: ImportRow, patch: Partial<RowChoice>) => void;
}): GridColDef<ReviewGridRow>[] => [
  {
    field: 'postedDate',
    headerName: 'Date',
    width: 96,
    valueFormatter: (value: string) => formatDate(value),
  },
  {
    field: 'description',
    headerName: 'Description',
    flex: 1,
    minWidth: 200,
    sortable: false,
    renderCell: ({ row }: GridRenderCellParams<ReviewGridRow>) => (
      <div className={styles.cellStack}>
        {row.action === 'save' ? (
          <TextField
            variant="standard"
            size="small"
            fullWidth
            value={row.description}
            onChange={(e) => setChoice(row, { description: e.target.value })}
            onKeyDown={stopGridKeys}
            slotProps={{
              htmlInput: { 'aria-label': `Description for ${row.bankDescription}` },
            }}
          />
        ) : (
          <span>{row.bankDescription}</span>
        )}
        <span className={styles.cellNote}>
          {rowNote(row)}
          {row.amexCategory ? ` · Amex: ${row.amexCategory}` : ''}
        </span>
      </div>
    ),
  },
  {
    field: 'amountCents',
    headerName: 'Amount',
    width: 90,
    renderCell: ({ row }: GridRenderCellParams<ReviewGridRow>) => (
      <Amount cents={row.amountCents} />
    ),
  },
  {
    field: 'category',
    headerName: 'Category',
    width: 230,
    sortable: false,
    renderCell: ({ row }: GridRenderCellParams<ReviewGridRow>) => {
      if (row.action !== 'save') return <span className={styles.placeholder}>—</span>;
      const note = suggestionNote(row, row.category);
      return (
        <div className={styles.cellStack}>
          <TextField
            select
            variant="standard"
            size="small"
            fullWidth
            value={row.category}
            onChange={(e) => setChoice(row, { category: e.target.value })}
            onKeyDown={stopGridKeys}
            slotProps={{
              select: {
                displayEmpty: true,
                inputProps: { 'aria-label': `Category for ${row.bankDescription}` },
              },
            }}
          >
            <MenuItem value="">
              <span className={styles.placeholder}>Choose…</span>
            </MenuItem>
            {categoryOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {note && <span className={styles.suggestionNote}>{note}</span>}
        </div>
      );
    },
  },
  {
    field: 'isGift',
    headerName: 'Gift',
    width: 60,
    sortable: false,
    renderCell: ({ row }: GridRenderCellParams<ReviewGridRow>) =>
      row.action === 'save' ? (
        <Checkbox
          size="small"
          checked={row.isGift}
          onChange={(e) => setChoice(row, { isGift: e.target.checked })}
          slotProps={{ input: { 'aria-label': `Gift: ${row.bankDescription}` } }}
        />
      ) : null,
  },
  {
    field: 'action',
    headerName: 'Action',
    width: 130,
    sortable: false,
    renderCell: ({ row }: GridRenderCellParams<ReviewGridRow>) => (
      <div>
        {actionsFor(row).map((action: ConfirmAction) => (
          <Button
            key={action}
            size="small"
            className={`${styles.actionButton} ${row.action === action ? styles.actionButtonActive : ''}`}
            aria-pressed={row.action === action}
            aria-label={`${action} ${row.suggestedDescription}`}
            onClick={() => setChoice(row, { action })}
          >
            {action}
          </Button>
        ))}
      </div>
    ),
  },
];
