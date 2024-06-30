import { DataGrid, GridRowId, GridRowModes, GridRowModesModel } from '@mui/x-data-grid';
import { FC, useEffect, useState } from 'react';
import { EditToolbar } from '../../components/EditToolBar';
import WarningModal from '../../components/warningModal/WarningModal';
import { tableStyles } from '../expenses/styles';
import { createTableColumns } from './columns';
import { withSidebar } from '../../components/sidebar/withSideBar';
import {
  useCreateIncomeEntryMutation,
  useGetIncomeEntriesQuery,
  useDeleteIncomeEntryMutation,
  useUpdateIncomeEntryMutation,
} from '../../services/income/incomeApi';
import { v4 as uuidv4 } from 'uuid';
import type { IncomeData } from '../../services/income/incomeApi.types';
import { format } from 'date-fns';
import { getRecurringIncomeEntries } from './helpers';
import { Context, CustomFooter } from './CustomFooter';

const IncomePage: FC = () => {
  const { data: incomeData, isLoading, isFetching } = useGetIncomeEntriesQuery({});

  useEffect(() => {
    if (incomeData) {
      setRows(incomeData);
    }
  }, [incomeData]);

  const [rows, setRows] = useState<IncomeData[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [selectedRows, setSelectedRows] = useState<IncomeData[]>([]);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (selectedRows.length > 0) {
      const total = selectedRows.reduce((acc, row) => acc + row.amount, 0);
      setTotal(total);
    } else {
      setTotal(null);
    }
  }, [selectedRows]);

  const [createIncomeEntry] = useCreateIncomeEntryMutation();
  const [updateIncomeEntry] = useUpdateIncomeEntryMutation();
  const [deleteIncomeEntry] = useDeleteIncomeEntryMutation();

  const handleOpenModal = (id: GridRowId) => () => {
    setOpenModal(true);
    setEntryId(id as string);
  };

  const handleDeleteRow = () => {
    deleteIncomeEntry({ id: entryId! });
  };

  const handleRowUpdate = async (newRow: IncomeData) => {
    if (newRow.isNew) {
      await createIncomeEntry({ data: newRow }).unwrap();
    } else {
      await updateIncomeEntry({ id: newRow.id!, data: newRow }).unwrap();
    }
    const updatedRow = { ...newRow, isNew: false };
    setRows((rows) => rows?.map((row) => (row.id === newRow.id ? updatedRow : row)));
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

  const onCreateNewRow = () => {
    const id = uuidv4();

    setRows((oldRows) => {
      const today = new Date();

      const date = format(today, 'yyyy-MM-dd');
      const newRow = {
        id,
        date,
        description: '',
        category: '',
        amount: 0,
        isNew: true,
      };

      return [newRow, ...oldRows];
    });

    setRowModesModel((oldModel) => {
      return {
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, fieldToFocus: 'date' },
      };
    });
  };

  const isExpensesLoading = isLoading || isFetching;
  const recurringIncomeEntries = getRecurringIncomeEntries();

  const onAddRecurringButtonClick = async () => {
    const today = new Date();
    const todayFormatted = format(today, 'yyyy-MM-dd');

    const incomeEntriesArray: IncomeData[] = [];

    recurringIncomeEntries.forEach((entry) => {
      incomeEntriesArray.push({
        ...entry,
        date: todayFormatted,
      });
    });

    await createIncomeEntry({ data: incomeEntriesArray }).unwrap();
  };

  return (
    <>
      <Context.Provider value={{ totalSelected: total }}>
        <h1>Assets</h1>
        <DataGrid
          rows={isExpensesLoading ? [] : rows}
          columns={columns}
          editMode="row"
          processRowUpdate={handleRowUpdate}
          rowModesModel={rowModesModel}
          onProcessRowUpdateError={(params) => {
            return params.updatedRow;
          }}
          slots={{
            toolbar: EditToolbar,
            footer: CustomFooter,
          }}
          slotProps={{
            toolbar: {
              setRows,
              setRowModesModel,
              onAddButtonClick: onCreateNewRow,
              onAddRecurringButtonClick,
            },
          }}
          sx={tableStyles}
          hideFooterPagination
          hideFooterSelectedRowCount
        />
      </Context.Provider>
      <WarningModal open={openModal} setOpen={setOpenModal} onDelete={handleDeleteRow} />
    </>
  );
};

const IncomePageWithSidebar = withSidebar()(IncomePage);
export default IncomePageWithSidebar;
