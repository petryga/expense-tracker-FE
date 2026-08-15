import { DataGrid, GridRowId, GridRowModes, GridRowModesModel } from '@mui/x-data-grid';
import { FC, useMemo, useState } from 'react';
import { useSyncedRows } from '../../hooks/useSyncedRows';
import { v4 as uuidv4 } from 'uuid';
import WarningModal from '../../components/warningModal/WarningModal';
import { tableStyles } from '../expenses/styles';
import { buildCategoryTree, Currency } from '../expenses/helpers';
import {
  useCreateRecurringExpenseMutation,
  useDeleteRecurringExpenseMutation,
  useGetRecurringExpensesQuery,
  useUpdateRecurringExpenseMutation,
} from '../../services/recurringExpenses/recurringExpensesApi';
import type { RecurringExpenseData } from '../../services/recurringExpenses/recurringExpensesApi.types';
import { useGetCategoriesQuery } from '../../services/categories/categoriesApi';
import { useGetAccountsQuery } from '../../services/accounts/accountsApi';
import { createRecurringExpenseColumns } from './recurringExpensesColumns';
import { AddEntryToolbar } from './AddEntryToolbar';

export const RecurringExpensesGrid: FC = () => {
  const { data: recurringExpenses, isLoading, isFetching } = useGetRecurringExpensesQuery({});
  const { data: categoryRecords } = useGetCategoriesQuery({});
  const categories = useMemo(() => buildCategoryTree(categoryRecords ?? []), [categoryRecords]);
  const { data: accounts } = useGetAccountsQuery({});
  const [rows, setRows] = useSyncedRows(recurringExpenses);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [openModal, setOpenModal] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);

  const [createRecurringExpense] = useCreateRecurringExpenseMutation();
  const [updateRecurringExpense] = useUpdateRecurringExpenseMutation();
  const [deleteRecurringExpense] = useDeleteRecurringExpenseMutation();

  const handleOpenModal = (id: GridRowId) => () => {
    setOpenModal(true);
    setEntryId(id as string);
  };

  const handleDeleteRow = () => {
    if (entryId) {
      deleteRecurringExpense({ id: entryId });
    }
  };

  const handleRowUpdate = async (newRow: RecurringExpenseData) => {
    if (newRow.isNew) {
      await createRecurringExpense({ data: newRow }).unwrap();
    } else {
      await updateRecurringExpense({ id: newRow.id!, data: newRow }).unwrap();
    }
    const updatedRow = { ...newRow, isNew: false };
    setRows((rows) => rows?.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const onAddButtonClick = () => {
    const id = uuidv4();
    const defaultAccount = accounts?.[0];

    setRows((oldRows) => [
      {
        id,
        account: defaultAccount?.name ?? '',
        description: '',
        category: '',
        currency: defaultAccount?.currency ?? Currency.USD,
        amount: 0,
        dayOfMonth: 1,
        isNew: true,
      },
      ...oldRows,
    ]);

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'description' },
    }));
  };

  const columns = createRecurringExpenseColumns({
    rowModesModel,
    setRowModesModel,
    rows,
    setRows,
    handleOpenModal,
    categories,
    accounts: accounts ?? [],
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
        showToolbar
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
