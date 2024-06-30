import { DataGrid, GridRowId, GridRowModesModel } from '@mui/x-data-grid';
import { createTableColumns } from './columns';
import { useEffect, useState } from 'react';
import { EditToolbar } from '../../components/EditToolBar';
import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useDeleteExpensesMutation,
  useGetExpensesQuery,
  useUpdateExpenseMutation,
} from '../../services/expenses/expensesApi';
import type { Data } from '../../services/expenses/expensesApi.types';
import { tableStyles } from './styles';
import { useNavigate, useParams } from 'react-router-dom';
import WarningModal from '../../components/warningModal/WarningModal';
import { format } from 'date-fns';
import { recurringExpenses } from './helpers';
import { Context, CustomFooter } from './CustomFooter';

export const ExpensesDataGrid = () => {
  const { yearMonth } = useParams();
  const {
    data: { data: expenses, expensesTotal } = {},
    isLoading,
    isFetching,
  } = useGetExpensesQuery({ yearMonth });

  const [rows, setRows] = useState<Data[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [total, setTotal] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<Data[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  useEffect(() => {
    if (selectedRows.length > 0) {
      const total = selectedRows.reduce((acc, row) => acc + row.amount, 0);
      setTotal(total);
    } else {
      setTotal(null);
    }
  }, [selectedRows]);

  useEffect(() => {
    if (expenses) {
      setRows(expenses);
    }
  }, [expenses]);

  const [createExpense] = useCreateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();
  const [deleteExpenses] = useDeleteExpensesMutation();
  const [updateExpense] = useUpdateExpenseMutation();

  const handleOpenModal = (id?: GridRowId) => () => {
    setOpenModal(true);
    id ? setEntryId(id as string) : setEntryId(null);
  };

  const handleDeleteRow = async () => {
    await deleteExpense({ id: entryId! });

    if (rows.length === 1) {
      navigate('/expenses');
    }
  };

  const handleDeleteRows = async () => {
    const selectedIds = selectedRows.filter((row) => row.id).map((row) => row.id as string);
    if (selectedIds.length > 0) {
      await deleteExpenses({ ids: selectedIds }).unwrap();
    }
  };

  const handleRowUpdate = async (newRow: Data) => {
    if (newRow.isNew) {
      await createExpense({ data: newRow }).unwrap();
    } else {
      await updateExpense({ id: newRow.id!, data: newRow }).unwrap();
    }
    const updatedRow = { ...newRow, isNew: false };

    const isNewRowOfTheSameYearMonth = () => {
      const rowDate = new Date(newRow.datePosted);
      const rowYearMonth = format(rowDate, 'yyyy-MM');
      return rowYearMonth === yearMonth;
    };

    setRows((rows) => rows?.map((row) => (row.id === newRow.id ? updatedRow : row)));

    if (!isNewRowOfTheSameYearMonth()) {
      setRows((rows) => rows?.filter((row) => row.id !== newRow.id));
    }

    return updatedRow;
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const { checked } = event.target;
    const selectedRow = rows.find((row) => row.id === id);

    if (checked && selectedRow) {
      setSelectedRows([...selectedRows, selectedRow]);
    } else {
      setSelectedRows(selectedRows.filter((row) => row.id !== id));
    }
  };

  const handleHeaderCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;

    if (checked) {
      setSelectedRows(rows);
    } else {
      setSelectedRows([]);
    }
  };

  const columns = createTableColumns({
    rowModesModel,
    setRowModesModel,
    rows,
    setRows,
    handleOpenModal,
    handleCheckboxChange,
    handleHeaderCheckboxChange,
    selectedRows,
  });

  const isExpensesLoading = isLoading || isFetching;

  const onAddRecurringButtonClick = async () => {
    const expensesArray: Data[] = [];
    const year = parseInt(yearMonth?.split('-')[0] as string);
    const month = parseInt(yearMonth?.split('-')[1] as string);

    recurringExpenses.forEach((expense) => {
      const { dayPosted, ...recurringExpense } = expense;
      const datePosted = format(new Date(year, month - 1, parseInt(dayPosted)), 'yyyy-MM-dd');

      expensesArray.push({
        ...recurringExpense,
        datePosted,
      });
    });

    await createExpense({ data: expensesArray }).unwrap();
  };

  return (
    <>
      <Context.Provider
        value={{
          totalSelected: total,
          expensesTotalAmount: expensesTotal?.totalAmountThisMonth,
        }}
      >
        <DataGrid
          rows={isExpensesLoading ? [] : rows}
          columns={columns}
          editMode="row"
          processRowUpdate={handleRowUpdate}
          rowModesModel={rowModesModel}
          onProcessRowUpdateError={(params) => params.updatedRow}
          slots={{
            toolbar: EditToolbar,
            footer: CustomFooter,
          }}
          slotProps={{
            toolbar: { setRows, setRowModesModel, onAddRecurringButtonClick },
          }}
          sx={tableStyles}
          hideFooterPagination
          hideFooterSelectedRowCount
        />
      </Context.Provider>

      <WarningModal
        open={openModal}
        setOpen={setOpenModal}
        onDelete={entryId ? handleDeleteRow : handleDeleteRows}
      />
    </>
  );
};
