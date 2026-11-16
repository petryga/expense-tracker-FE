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
  return (
    <div className={`${styles.footer} ${r.balanced ? '' : styles.footerBad}`}>
      <span>
        {r.balanced
          ? `Reconciled with the file: ${money(r.fileTotalCents)}`
          : `Does not reconcile: file ${money(r.fileTotalCents)}, imported ${money(r.importedCents + r.duplicateTotalCents)}`}
      </span>
      <span>
        {ctx.detail.rowCount} rows · {ctx.detail.draftCount} to review
      </span>
    </div>
  );
};
