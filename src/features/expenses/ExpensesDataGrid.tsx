import {
  DataGrid,
  FooterPropsOverrides,
  GridFilterModel,
  GridRowId,
  GridRowModesModel,
} from '@mui/x-data-grid';
import { createTableColumns } from './columns';
import { useMemo, useState } from 'react';
import { useSyncedRows } from '../../hooks/useSyncedRows';
import { EditToolbar } from '../../components/EditToolBar';
import {
  handleDownloadExpenses,
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
import { format, parseISO } from 'date-fns';
import { buildCategoryTree, Currency } from './helpers';
import { CustomFooter } from './CustomFooter';
import { Context } from './FooterContext';
import ConfirmationModal from './ConfirmationModal';
import { useGetRecurringExpensesQuery } from '../../services/recurringExpenses/recurringExpensesApi';
import { useGetCategoriesQuery } from '../../services/categories/categoriesApi';
import { useGetAccountsQuery } from '../../services/accounts/accountsApi';
import styles from './ExpensesPage.module.css';

const NoRowsOverlay = ({ yearMonth }: { yearMonth?: string }) => (
  <div className={styles.noRowsOverlay}>
    {yearMonth && (
      <div className={styles.noRowsMonth}>{format(parseISO(`${yearMonth}-01`), 'MMMM yyyy')}</div>
    )}
    <div>No rows</div>
  </div>
);

export const ExpensesDataGrid = () => {
  const { yearMonth } = useParams();
  const {
    data: { data: expenses, expensesTotal } = {},
    isLoading,
    isFetching,
  } = useGetExpensesQuery({ yearMonth }, { refetchOnMountOrArgChange: true });
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [rows, setRows] = useSyncedRows(expenses);
  const [openModal, setOpenModal] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<Data[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  // Selected-row totals are a pure function of the selection, so they are
  // derived during render rather than mirrored into state by an effect.
  const [totalCad, totalUsd] = useMemo<[number | null, number | null]>(() => {
    if (selectedRows.length === 0) return [null, null];
    return [
      selectedRows.reduce(
        (acc, row) => (row.currency === Currency.CAD ? acc + row.amount : acc),
        0,
      ),
      selectedRows.reduce(
        (acc, row) => (row.currency === Currency.USD ? acc + row.amount : acc),
        0,
      ),
    ];
  }, [selectedRows]);

  const { data: recurringExpenses } = useGetRecurringExpensesQuery({});
  const { data: categoryRecords } = useGetCategoriesQuery({});
  const categories = useMemo(() => buildCategoryTree(categoryRecords ?? []), [categoryRecords]);
  const budgetByCategory = useMemo(
    () =>
      Object.fromEntries(
        (categoryRecords ?? [])
          .filter((category) => category.budget !== null)
          .map((category) => [category.name, category.budget as number]),
      ),
    [categoryRecords],
  );
  const { data: accounts } = useGetAccountsQuery({});
  const [createExpense] = useCreateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();
  const [deleteExpenses] = useDeleteExpensesMutation();
  const [updateExpense] = useUpdateExpenseMutation();

  const handleOpenModal = (id?: GridRowId) => () => {
    setOpenModal(true);
    setEntryId(id ? (id as string) : null);
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
      const rowYearMonth = newRow.datePosted.slice(0, 7);
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
    categories,
    budgetByCategory,
    accounts: accounts ?? [],
  });

  const isExpensesLoading = isLoading || isFetching;

  const onAddRecurringButtonClick = async () => {
    if (!recurringExpenses?.length) return;

    const expensesArray: Data[] = [];
    const year = parseInt(yearMonth?.split('-')[0] as string);
    const month = parseInt(yearMonth?.split('-')[1] as string);

    recurringExpenses.forEach((expense) => {
      const { id: _id, dayOfMonth, isNew: _isNew, ...recurringExpense } = expense;
      const datePosted = format(new Date(year, month - 1, dayOfMonth), 'yyyy-MM-dd');

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
          totalSelectedCad: totalCad,
          totalSelectedUsd: totalUsd,
          expensesTotalAmountCad: expensesTotal?.totalAmountThisMonthCad,
          expensesTotalAmountUsd: expensesTotal?.totalAmountThisMonthUsd,
        }}
      >
        <DataGrid
          rows={isExpensesLoading ? [] : rows}
          loading={isExpensesLoading}
          columns={columns}
          editMode="row"
          processRowUpdate={handleRowUpdate}
          rowModesModel={rowModesModel}
          onProcessRowUpdateError={(params) => params.updatedRow}
          showToolbar
          slots={{
            toolbar: EditToolbar,
            footer: CustomFooter,
            noRowsOverlay: NoRowsOverlay,
          }}
          slotProps={{
            toolbar: {
              setRows,
              setRowModesModel,
              onAddRecurringButtonClick,
              filterModel,
              recurringDisabled: recurringExpenses !== undefined && recurringExpenses.length === 0,
              accounts: accounts ?? [],
            },
            footer: {
              setOpenConfirmationModal,
              filterModel,
              setFilterModel,
              hasEntries: rows.some((row) => !row.isNew),
            } as FooterPropsOverrides,
            noRowsOverlay: { yearMonth } as object,
          }}
          sx={tableStyles}
          hideFooterPagination
          hideFooterSelectedRowCount
          autoHeight
          onFilterModelChange={(newModel) => setFilterModel(newModel)}
          getRowHeight={() => 'auto'}
        />
      </Context.Provider>

      <WarningModal
        open={openModal}
        setOpen={setOpenModal}
        onDelete={entryId ? handleDeleteRow : handleDeleteRows}
      />

      <ConfirmationModal
        open={openConfirmationModal}
        setOpen={setOpenConfirmationModal}
        onConfirm={handleDownloadExpenses}
      />
    </>
  );
};
