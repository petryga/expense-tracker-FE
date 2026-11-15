import { type FC, useState } from 'react';
import { Button } from '@mui/material';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { UrlTabs } from '../../../components/urlTabs/UrlTabs';
import { useDeleteImportMutation, useGetImportQuery } from '../../../services/imports/importsApi';
import { ErrorBox, FaIcon } from '../components';
import { DeleteImportDialog } from './DeleteImportDialog';
import { DoneGrid } from './DoneGrid';
import { ReviewGrid } from './ReviewGrid';
import styles from '../ImportsPage.module.css';

// One import: title with delete, counts, and a tab per row status.
export const ImportReview: FC<{ id: string; onRemoved: () => void }> = ({ id, onRemoved }) => {
  const { data: detail, isLoading, error } = useGetImportQuery(id);
  const [deleteImport, deletion] = useDeleteImportMutation();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  if (isLoading) return <p className={styles.empty}>Loading…</p>;
  if (error || !detail)
    return <ErrorBox error={error ?? { data: { error: 'Import not found' } }} />;

  const of = (status: string) => detail.rows.filter((row) => row.status === status);
  const { byStatus, reconciliation } = detail;

  return (
    <>
      <header className={styles.importHeader}>
        <div className={styles.titleRow}>
          <h2 className={styles.importTitle}>
            {detail.fileName} · {detail.account} ({detail.currency})
          </h2>
          <Button
            size="small"
            color="error"
            startIcon={<FaIcon icon={faTrash} />}
            disabled={deletion.isLoading}
            onClick={() => setConfirmingDelete(true)}
          >
            Delete import
          </Button>
        </div>
        <ErrorBox error={deletion.error} />
        <DeleteImportDialog
          detail={detail}
          open={confirmingDelete}
          onClose={() => setConfirmingDelete(false)}
          onConfirm={async (keepExpenses) => {
            setConfirmingDelete(false);
            const result = await deleteImport({ id: detail.id, keepExpenses });
            if (!('error' in result)) onRemoved();
          }}
        />
        <div className={styles.summary}>
          <span>{detail.rowCount} rows in file</span>
          <span>{byStatus.saved?.count ?? 0} saved</span>
          <span>{byStatus.returned?.count ?? 0} returned</span>
          <span>{byStatus.skipped?.count ?? 0} skipped</span>
          {reconciliation.duplicateCount > 0 && (
            <span>{reconciliation.duplicateCount} already imported earlier</span>
          )}
        </div>
      </header>
      <div className={styles.tabs}>
        <UrlTabs
          sections={[
            {
              id: 'review',
              label: `To review (${detail.draftCount})`,
              content: <ReviewGrid key={detail.id} detail={detail} />,
            },
            {
              id: 'returned',
              label: `Returned (${of('returned').length})`,
              content: (
                <DoneGrid
                  label="Returned"
                  rows={of('returned')}
                  note="Purchases refunded in full, and their refunds. Neither becomes an expense; the two can be in different months and different files."
                />
              ),
            },
            {
              id: 'skipped',
              label: `Skipped (${of('skipped').length})`,
              content: (
                <DoneGrid
                  label="Skipped"
                  rows={of('skipped')}
                  note="Card payments and reward credits are never expenses, plus anything you skipped. Review again puts a row back in To review."
                  reopenFrom={detail.id}
                />
              ),
            },
            {
              id: 'saved',
              label: `Saved (${of('saved').length})`,
              content: <DoneGrid label="Saved" rows={of('saved')} note="Rows saved as expenses." />,
            },
          ]}
        />
      </div>
    </>
  );
};
