import { DataGrid, GridRowId, GridRowModes, GridRowModesModel } from '@mui/x-data-grid';
import { FC, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import WarningModal from '../../components/warningModal/WarningModal';
import { tableStyles } from '../expenses/styles';
import { Currency } from '../expenses/helpers';
import { IncomeCategories } from '../income/helpers';
import {
  useCreateRecurringIncomeMutation,
  useDeleteRecurringIncomeMutation,
  useGetRecurringIncomeQuery,
  useUpdateRecurringIncomeMutation,
} from '../../services/recurringIncome/recurringIncomeApi';
import type { RecurringIncomeData } from '../../services/recurringIncome/recurringIncomeApi.types';
import { createRecurringIncomeColumns } from './recurringIncomeColumns';
import { AddEntryToolbar } from './AddEntryToolbar';

export const RecurringIncomeGrid: FC = () => {
  const { data: recurringIncome, isLoading, isFetching } = useGetRecurringIncomeQuery({});
  const [rows, setRows] = useState<RecurringIncomeData[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [openModal, setOpenModal] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);

  // Rows are locally mutable (inline edits and added rows), so query data is
  // copied into state rather than read directly. Adjusting it during render
  // instead of in an effect avoids the extra commit a sync effect would cause.
  const [syncedIncome, setSyncedIncome] = useState(recurringIncome);
  if (recurringIncome && recurringIncome !== syncedIncome) {
    setSyncedIncome(recurringIncome);
    setRows(recurringIncome);
  }

  const [createRecurringIncome] = useCreateRecurringIncomeMutation();
  const [updateRecurringIncome] = useUpdateRecurringIncomeMutation();
  const [deleteRecurringIncome] = useDeleteRecurringIncomeMutation();

  const handleOpenModal = (id: GridRowId) => () => {
    setOpenModal(true);
    setEntryId(id as string);
  };

  const handleDeleteRow = () => {
    if (entryId) {
      deleteRecurringIncome({ id: entryId });
    }
  };

  const handleRowUpdate = async (newRow: RecurringIncomeData) => {
    if (newRow.isNew) {
      await createRecurringIncome({ data: newRow }).unwrap();
    } else {
      await updateRecurringIncome({ id: newRow.id!, data: newRow }).unwrap();
    }
    const updatedRow = { ...newRow, isNew: false };
    setRows((rows) => rows?.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const onAddButtonClick = () => {
    const id = uuidv4();

    setRows((oldRows) => [
      {
        id,
        category: IncomeCategories.BANK_ACCOUNTS,
        description: '',
        currency: Currency.CAD,
        amount: 0,
        isNew: true,
      },
      ...oldRows,
    ]);

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'description' },
    }));
  };

  const columns = createRecurringIncomeColumns({
    rowModesModel,
    setRowModesModel,
    rows,
    setRows,
    handleOpenModal,
  });

  return (
    <>
      <DataGrid
        rows={isLoading || isFetching ? [] : rows}
        columns={columns}
        editMode="row"
        processRowUpdate={handleRowUpdate}
        rowModesModel={rowModesModel}
        onProcessRowUpdateError={(params) => params.updatedRow}
        slots={{ toolbar: AddEntryToolbar }}
        slotProps={{ toolbar: { onAddButtonClick } }}
        sx={tableStyles}
        hideFooterPagination
        hideFooterSelectedRowCount
        autoHeight
        getRowHeight={() => 'auto'}
      />

      <WarningModal open={openModal} setOpen={setOpenModal} onDelete={handleDeleteRow} />
    </>
  );
};
