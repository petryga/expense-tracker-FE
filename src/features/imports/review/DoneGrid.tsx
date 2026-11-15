import { type FC, createContext, useContext, useState } from 'react';
import { Button } from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid';
import { useReopenRowsMutation } from '../../../services/imports/importsApi';
import type { ImportRow } from '../../../services/imports/importsApi.types';
import { formatDate } from '../../../utils';
import { tableStyles } from '../../expenses/styles';
import { Amount, ErrorBox } from '../components';
import { goldButton, money } from '../formatting';
import styles from '../ImportsPage.module.css';

// The Returned, Skipped and Saved tabs: read-only rows. Skipped rows also get
// checkboxes and a "Review again" button.
const doneColumns: GridColDef<ImportRow>[] = [
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
    minWidth: 180,
    renderCell: ({ row }: GridRenderCellParams<ImportRow>) => (
      <div className={styles.cellStack}>
        <span>{row.description}</span>
        {row.matched && (
          <span className={styles.cellNote}>
            {row.kind === 'refund' ? 'Purchase' : 'Refunded'} {formatDate(row.matched.postedDate)},{' '}
            {money(row.matched.amountCents)}
          </span>
        )}
      </div>
    ),
  },
  {
    field: 'amountCents',
    headerName: 'Amount',
    width: 90,
    renderCell: ({ row }: GridRenderCellParams<ImportRow>) => <Amount cents={row.amountCents} />,
  },
  { field: 'kind', headerName: 'Type', width: 90 },
  { field: 'category', headerName: 'Category', width: 160 },
];

// Selection for "Review again". The grid's select-all checkbox reports
// "everything except these", so both shapes are handled.
const selectedIds = (model: GridRowSelectionModel, rows: ImportRow[]) =>
  model.type === 'include'
    ? rows.filter((row) => model.ids.has(row.id)).map((row) => row.id)
    : rows.filter((row) => !model.ids.has(row.id)).map((row) => row.id);

const ReopenContext = createContext({ count: 0, busy: false, onReopen: () => {} });

const ReopenToolbar: FC = () => {
  const { count, busy, onReopen } = useContext(ReopenContext);
  return (
    <GridToolbarContainer>
      <div className={styles.toolbar}>
        <span className={styles.toolbarNote}>
          {count ? `${count} selected` : 'Select rows to put them back in To review.'}
        </span>
        <Button sx={goldButton} disabled={!count || busy} onClick={onReopen}>
          {count ? `Review again (${count})` : 'Review again'}
        </Button>
      </div>
    </GridToolbarContainer>
  );
};

const EMPTY_SELECTION: GridRowSelectionModel = { type: 'include', ids: new Set() };

export const DoneGrid: FC<{
  rows: ImportRow[];
  label: string;
  note: string;
  // Skipped rows can go back to review: checkboxes plus one button.
  reopenFrom?: string;
}> = ({ rows, label, note, reopenFrom }) => {
  const [reopen, reopening] = useReopenRowsMutation();
  const [selection, setSelection] = useState<GridRowSelectionModel>(EMPTY_SELECTION);
  const ids = selectedIds(selection, rows);
  return (
    <>
      <p className={styles.hint}>{note}</p>
      <ErrorBox error={reopening.error} />
      <ReopenContext.Provider
        value={{
          count: ids.length,
          busy: reopening.isLoading,
          onReopen: async () => {
            if (!reopenFrom) return;
            const result = await reopen({ id: reopenFrom, rowIds: ids });
            if ('data' in result) setSelection(EMPTY_SELECTION);
          },
        }}
      >
        <DataGrid
          aria-label={label}
          rows={rows}
          columns={doneColumns}
          sx={{ ...tableStyles, minHeight: 0, mt: 1.5 }}
          hideFooterPagination
          hideFooterSelectedRowCount
          autoHeight
          getRowHeight={() => 'auto'}
          disableRowSelectionOnClick
          checkboxSelection={!!reopenFrom}
          rowSelectionModel={selection}
          onRowSelectionModelChange={setSelection}
          showToolbar={!!reopenFrom}
          slots={reopenFrom ? { toolbar: ReopenToolbar } : {}}
        />
      </ReopenContext.Provider>
    </>
  );
};
