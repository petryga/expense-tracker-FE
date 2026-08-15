import {
  DataGrid,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
} from "@mui/x-data-grid";
import { FC, useMemo, useState } from "react";
import { EditToolbar } from "../../components/EditToolBar";
import type { EditToolbarProps } from "../expenses/ExpensesPage.types";
import WarningModal from "../../components/warningModal/WarningModal";
import { tableStyles } from "../expenses/styles";
import { createTableColumns } from "./columns";
import { withSidebar } from "../../components/sidebar/withSideBar";
import {
  useCreateIncomeEntryMutation,
  useGetIncomeEntriesQuery,
  useDeleteIncomeEntryMutation,
  useUpdateIncomeEntryMutation,
} from "../../services/income/incomeApi";
import { v4 as uuidv4 } from "uuid";
import type { IncomeData } from "../../services/income/incomeApi.types";
import { format } from "date-fns";
import { getRowClassName } from "./helpers";
import { CustomFooter } from "./CustomFooter";
import { Context } from "./FooterContext";
import { Currency } from "../expenses/helpers";
import { useGetRecurringIncomeQuery } from "../../services/recurringIncome/recurringIncomeApi";

const AssetsPage: FC = () => {
  const {
    data: incomeData,
    isLoading,
    isFetching,
  } = useGetIncomeEntriesQuery({});

  const [rows, setRows] = useState<IncomeData[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [selectedRows, setSelectedRows] = useState<IncomeData[]>([]);

  // Rows are locally mutable (inline edits and added rows), so query data is
  // copied into state. Adjusted during render rather than in an effect -- which
  // also fixes the sync effect previously sitting above these declarations and
  // calling setRows before it was defined.
  const [syncedIncome, setSyncedIncome] = useState(incomeData);
  if (incomeData && incomeData !== syncedIncome) {
    setSyncedIncome(incomeData);
    setRows(incomeData);
  }

  // Selected-row totals are a pure function of the selection.
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
    setRows((rows) =>
      rows?.map((row) => (row.id === newRow.id ? updatedRow : row)),
    );
    return updatedRow;
  };

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => {
    const { checked } = event.target;
    const selectedRow = rows.find((row) => row.id === id);

    if (checked && selectedRow) {
      setSelectedRows([...selectedRows, selectedRow]);
    } else {
      setSelectedRows(selectedRows.filter((row) => row.id !== id));
    }
  };

  const handleHeaderCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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

      const date = format(today, "yyyy-MM-dd");
      const newRow = {
        id,
        date,
        description: "",
        category: "",
        amount: 0,
        isNew: true,
        currency: Currency.CAD,
      };

      return [newRow, ...oldRows];
    });

    setRowModesModel((oldModel) => {
      return {
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, fieldToFocus: "date" },
      };
    });
  };

  const isExpensesLoading = isLoading || isFetching;
  const { data: recurringIncomeEntries } = useGetRecurringIncomeQuery({});

  const onAddRecurringButtonClick = async () => {
    if (!recurringIncomeEntries?.length) return;

    const today = new Date();
    const todayFormatted = format(today, "yyyy-MM-dd");

    const incomeEntriesArray: IncomeData[] = [];

    recurringIncomeEntries.forEach((entry) => {
      const { id: _id, isNew: _isNew, ...recurringEntry } = entry;
      incomeEntriesArray.push({
        ...recurringEntry,
        date: todayFormatted,
      });
    });

    await createIncomeEntry({ data: incomeEntriesArray }).unwrap();
  };

  return (
    <>
      <Context.Provider
        value={{ totalSelectedCad: totalCad, totalSelectedUsd: totalUsd }}
      >
        <h1>Assets</h1>
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
          }}
          slotProps={{
            toolbar: {
              // EditToolbar's setRows is typed for expenses' Data[] since it's
              // shared with ExpensesDataGrid, but that fallback branch only
              // runs when onAddButtonClick is absent — here it's always
              // provided (onCreateNewRow), so setRows is never actually
              // invoked by EditToolbar in this usage.
              setRows: setRows as unknown as EditToolbarProps["setRows"],
              setRowModesModel,
              onAddButtonClick: onCreateNewRow,
              onAddRecurringButtonClick,
              recurringDisabled:
                recurringIncomeEntries !== undefined && recurringIncomeEntries.length === 0,
            },
          }}
          autoHeight
          getRowHeight={() => "auto"}
          sx={tableStyles}
          hideFooterPagination
          hideFooterSelectedRowCount
          getRowClassName={(params) => getRowClassName(params, rows)}
        />
      </Context.Provider>
      <WarningModal
        open={openModal}
        setOpen={setOpenModal}
        onDelete={handleDeleteRow}
      />
    </>
  );
};

const AssetsPageWithSidebar = withSidebar()(AssetsPage);
export default AssetsPageWithSidebar;
