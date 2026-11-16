import { type FC, useContext } from 'react';
import { Button } from '@mui/material';
import { GridToolbarContainer } from '@mui/x-data-grid';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { ReviewContext } from './reviewContext';
import { FaIcon } from '../components';
import { goldButton, money } from '../formatting';
import styles from '../ImportsPage.module.css';

export const ReviewToolbar: FC = () => {
  const ctx = useContext(ReviewContext);
  if (!ctx) return null;
  return (
    <GridToolbarContainer>
      <div className={styles.toolbar}>
        <span className={styles.toolbarNote}>
          {ctx.pending > 0 && `Getting suggestions for ${ctx.pending} rows… `}
          {ctx.waiting > 0
            ? `${ctx.waiting} rows still need a category. Rows without one stay here for later.`
            : 'Every row is decided. Check the suggestions, then Confirm saves them all at once.'}
        </span>
        <Button
          sx={goldButton}
          startIcon={<FaIcon icon={faCheck} />}
          disabled={!ctx.decisionsCount || ctx.saving}
          onClick={ctx.onConfirm}
        >
          {ctx.saving ? 'Saving…' : `Confirm ${ctx.decisionsCount} rows`}
        </Button>
      </div>
    </GridToolbarContainer>
  );
};

export const ReconciliationFooter: FC = () => {
  const ctx = useContext(ReviewContext);
  if (!ctx) return null;
  const r = ctx.detail.reconciliation;
  const { byKind } = ctx.detail;
  // Purchases versus everything paid back onto the card (payments, refunds,
  // rewards): the file's total is the two together, so it can be negative.
  const charges = byKind.charge?.cents ?? 0;
  const credits = ['refund', 'payment', 'reward'].reduce(
    (sum, kind) => sum + (byKind[kind]?.cents ?? 0),
    0,
  );
  const earlier = r.duplicateCount ? `, plus ${r.duplicateCount} imported earlier` : '';
  return (
    <div className={`${styles.footer} ${r.balanced ? '' : styles.footerBad}`}>
      <span>
        {r.balanced
          ? `✓ Every row in the file is here: charges ${money(charges)}, payments and credits ${money(credits)}${earlier}.`
          : `Rows are missing: the file adds up to ${money(r.fileTotalCents)}, but the rows here add up to ${money(r.importedCents + r.duplicateTotalCents)}.`}
      </span>
      <span>
        {ctx.detail.rowCount} rows · {ctx.detail.draftCount} to review
      </span>
    </div>
  );
};
