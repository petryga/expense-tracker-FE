import type { FC } from 'react';
import { Button, MenuItem, TextField } from '@mui/material';
import type { ImportRow } from '../../../services/imports/importsApi.types';
import { formatDate } from '../../../utils';
import { formatCents, returnedItems, splitItems } from './reviewState';
import styles from '../ImportsPage.module.css';

// What the description cell says about an Amazon charge (PLANS.md, Phase D):
// split into its items, several orders to pick from, or kept whole.
export const AmazonNote: FC<{
  row: ImportRow;
  label: string; // the bank's text, for screen readers
  busy: boolean;
  onChoose: (orderKey: string | null) => void;
}> = ({ row, label, busy, onChoose }) => {
  const items = splitItems(row);
  const returned = returnedItems(row).length;
  if (row.amazonStatus === 'matched' && items.length) {
    return (
      <span className={styles.cellNote}>
        Amazon order: split into {items.length} {items.length === 1 ? 'item' : 'items'} below.
        {returned > 0 && ` ${returned} more refunded, not saved.`}{' '}
        <Button
          size="small"
          className={styles.linkButton}
          disabled={busy}
          onClick={() => onChoose(null)}
        >
          Keep as one
        </Button>
      </span>
    );
  }
  if (row.amazonStatus === 'ambiguous' && row.amazonCandidates?.length) {
    return (
      <TextField
        select
        variant="standard"
        size="small"
        fullWidth
        value=""
        disabled={busy}
        onChange={(e) => onChoose(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        slotProps={{
          select: {
            displayEmpty: true,
            inputProps: { 'aria-label': `Amazon order for ${label}` },
          },
        }}
      >
        <MenuItem value="">
          <span className={styles.placeholder}>
            {row.amazonCandidates.every((c) => c.partial)
              ? 'Maybe an Amazon order paid partly with a gift card: pick it to split…'
              : `${row.amazonCandidates.length} Amazon orders fit: pick one to split it…`}
          </span>
        </MenuItem>
        {row.amazonCandidates.map((c) => (
          <MenuItem key={c.key} value={c.key}>
            {formatDate(c.shipDate ?? c.orderDate ?? '')}:{' '}
            {c.items
              .map((i) => `${i.description.slice(0, 40)} (${formatCents(i.amountCents)})`)
              .join(', ')}
            {c.partial ? ' · a gift card paid the rest' : ''}
          </MenuItem>
        ))}
      </TextField>
    );
  }
  return null;
};
