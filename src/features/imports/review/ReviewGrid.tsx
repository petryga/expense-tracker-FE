import { type FC, useMemo, useState } from 'react';
import { Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useGetCategoriesQuery } from '../../../services/categories/categoriesApi';
import { useConfirmImportMutation } from '../../../services/imports/importsApi';
import type { ImportDetail, ImportRow } from '../../../services/imports/importsApi.types';
import { buildCategoryTree } from '../../expenses/helpers';
import { tableStyles } from '../../expenses/styles';
import { transformCategoriesForDropdown } from '../../../utils';
import { ErrorBox } from '../components';
import { createReviewColumns, type ReviewGridRow } from './reviewColumns';
import { ReviewContext } from './reviewContext';
import { ReconciliationFooter, ReviewToolbar } from './ReviewGridSlots';
import { buildDecisions, defaultChoice, pendingCount, type RowChoice } from './reviewState';
import styles from '../ImportsPage.module.css';

// The "To review" tab: one row per draft, all editable, one confirm for all.
export const ReviewGrid: FC<{ detail: ImportDetail }> = ({ detail }) => {
  const { data: categoryRecords } = useGetCategoriesQuery({});
  const categoryOptions = useMemo(
    () => transformCategoriesForDropdown(buildCategoryTree(categoryRecords ?? [])),
    [categoryRecords],
  );
  const [choices, setChoices] = useState<Record<string, RowChoice>>({});
  const [confirm, { isLoading, error, data: lastResult }] = useConfirmImportMutation();

  const drafts = detail.rows.filter((row) => row.status === 'draft');
  const choiceFor = (row: ImportRow) => choices[row.id] ?? defaultChoice(row);
  const setChoice = (row: ImportRow, patch: Partial<RowChoice>) =>
    setChoices((prev) => ({ ...prev, [row.id]: { ...choiceFor(row), ...patch } }));
  const rows: ReviewGridRow[] = drafts.map((row) => ({
    ...row,
    ...choiceFor(row),
    bankDescription: row.description,
  }));
  const decisions = buildDecisions(detail.rows, choices);
  const columns = createReviewColumns({ categoryOptions, setChoice });

  if (!drafts.length) {
    return <p className={styles.empty}>Everything in this import has been reviewed.</p>;
  }

  return (
    <ReviewContext.Provider
      value={{
        detail,
        decisionsCount: decisions.length,
        waiting: drafts.length - decisions.length,
        pending: pendingCount(detail.rows),
        saving: isLoading,
        onConfirm: async () => {
          const result = await confirm({ id: detail.id, rows: decisions });
          if ('data' in result) setChoices({});
        },
      }}
    >
      <ErrorBox error={error} />
      {lastResult && (
        <Alert severity="success" sx={{ mb: 1.5 }}>
          Saved {lastResult.saved}, skipped {lastResult.skipped}, returned {lastResult.returned}.
        </Alert>
      )}
      <DataGrid
        aria-label="Rows to review"
        rows={rows}
        columns={columns}
        showToolbar
        slots={{ toolbar: ReviewToolbar, footer: ReconciliationFooter }}
        sx={tableStyles}
        hideFooterPagination
        hideFooterSelectedRowCount
        autoHeight
        getRowHeight={() => 'auto'}
        disableRowSelectionOnClick
      />
    </ReviewContext.Provider>
  );
};
