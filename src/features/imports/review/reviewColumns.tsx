import { Button, Checkbox, MenuItem, TextField } from '@mui/material';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { ConfirmAction, ImportRow } from '../../../services/imports/importsApi.types';
import { formatDate } from '../../../utils';
import { Amount } from '../components';
import { AmazonNote } from './amazonCells';
import {
  actionsFor,
  returnsSavedPurchase,
  splitItems,
  suggestionNote,
  type RowChoice,
} from './reviewState';
import styles from '../ImportsPage.module.css';

// `description` is what the expense will be called (editable); the bank's own
// text stays in `bankDescription`. An item of a split Amazon charge is a row
// of its own right under the charge, with `itemOf` set to the charge; its
// `bankDescription` is the full product name.
export type ReviewGridRow = ImportRow &
  RowChoice & { bankDescription: string; itemOf?: ImportRow; quantity?: number };

const isSplit = (row: ReviewGridRow) => !row.itemOf && splitItems(row).length > 0;

// The grid uses arrow keys, space and enter for its own navigation; inside an
// input they belong to the input.
const stopGridKeys = (event: { stopPropagation: () => void }) => event.stopPropagation();

const rowNote = (row: ReviewGridRow) => {
  if (row.matchedItem)
    return `Refund for "${row.matchedItem.description.slice(0, 60)}", one item of the ${row.matchedItem.chargePostedDate ? formatDate(row.matchedItem.chargePostedDate) : ''} Amazon charge, already saved. Return removes that item's expense.`;
  if (returnsSavedPurchase(row) && row.matched)
    return `Refund for the ${formatDate(row.matched.postedDate)} purchase already saved. Return removes that expense.`;
  if (row.kind === 'refund' && !row.matched)
    return 'Refund with no matching purchase: skip it, or save it as a negative expense.';
  if (row.itemOf)
    return `${row.quantity && row.quantity > 1 ? `${row.quantity} × ` : ''}${row.bankDescription}`;
  return row.bankDescription;
};

// Every row is editable at once: description and category are plain inputs
// that write straight into the row's choice.
export const createReviewColumns = ({
  categoryOptions,
  setChoice,
  chooseOrder,
  choosing,
}: {
  categoryOptions: { value: string; label: string }[];
  setChoice: (row: ReviewGridRow, patch: Partial<RowChoice>) => void;
  chooseOrder: (row: ImportRow, orderKey: string | null) => void;
  choosing: boolean;
}): GridColDef<ReviewGridRow>[] => [
  {
    field: 'postedDate',
    headerName: 'Date',
    width: 96,
    renderCell: ({ row }: GridRenderCellParams<ReviewGridRow>) =>
      row.itemOf ? '' : formatDate(row.postedDate),
  },
  {
    field: 'description',
    headerName: 'Description',
    flex: 1,
    minWidth: 200,
    sortable: false,
    renderCell: ({ row }: GridRenderCellParams<ReviewGridRow>) => (
      <div className={`${styles.cellStack} ${row.itemOf ? styles.itemCell : ''}`}>
        {row.action === 'save' && !isSplit(row) ? (
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
        {!isSplit(row) && (
          <span className={`${styles.cellNote} ${row.itemOf ? styles.clampTwo : ''}`}>
            {rowNote(row)}
            {row.amexCategory ? ` · Amex: ${row.amexCategory}` : ''}
          </span>
        )}
        {!row.itemOf && (
          <AmazonNote
            row={row}
            label={row.bankDescription}
            busy={choosing}
            onChoose={(key) => chooseOrder(row, key)}
          />
        )}
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
      if (isSplit(row)) return <span className={styles.placeholder}>Per item, below</span>;
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
      row.action === 'save' && !isSplit(row) ? (
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
    renderCell: ({ row }: GridRenderCellParams<ReviewGridRow>) =>
      row.itemOf ? null : (
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
