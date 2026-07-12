import {
  accountCurrencyMap,
  AccountType,
  Currency,
  paymentOptions,
} from "./helpers";
import { GridColDef, GridRowId, GridRowModes } from "@mui/x-data-grid";
import {
  faTrash,
  faSave,
  faEdit,
  faTimes,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { formatDate, transformCategoriesForDropdown } from "../../utils";
import type { Category, TableColumns } from "./ExpensesPage.types";
import { Checkbox } from "@mui/material";
import styles from "./ExpensesPage.module.css";
import type { Data } from "../../services/expenses/expensesApi.types";
import { v4 as uuidv4 } from "uuid";
import { renderEditCell } from "../../components/amountTableCell/AmountTableCell";

export function createTableColumns({
  rowModesModel,
  setRowModesModel,
  rows,
  setRows,
  handleOpenModal,
  handleCheckboxChange,
  handleHeaderCheckboxChange,
  selectedRows,
  categories,
}: TableColumns): GridColDef[] {
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows?.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows?.filter((row) => row.id !== id) || []);
    }
  };

  const createCopyOfThisRow = (row: Data) => {
    const id = uuidv4();
    const newRow = {
      ...row,
      id,
      isNew: true,
      description: `${row.description} (copy)`,
    };

    setRows((currentRows) => {
      const rowIndex = currentRows.findIndex((r) => r.id === row.id);
      const newRows = [...currentRows];
      if (rowIndex !== -1) {
        newRows.splice(rowIndex + 1, 0, newRow);
      }
      return newRows;
    });
  };

  return [
    {
      field: "selection",
      sortable: false,
      headerName: "",
      disableColumnMenu: true,
      type: "boolean",
      width: 60,
      renderCell: (params) => {
        return (
          <Checkbox
            checked={params.value || selectedRows.includes(params.row)}
            onChange={(event) =>
              handleCheckboxChange(event, params.id as string)
            }
            color="primary"
          />
        );
      },
      renderHeader: () => (
        <Checkbox onChange={handleHeaderCheckboxChange} color="primary" />
      ),
    },
    {
      field: "datePosted",
      headerName: "Date Posted",
      width: 100,
      editable: true,
      type: "date",
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "account",
      headerName: "Account",
      width: 95,
      type: "singleSelect",
      valueOptions: paymentOptions,
      editable: true,

      preProcessEditCellProps: (params) => {
        if (params.row.isNew) {
          const newCurrency =
            accountCurrencyMap[params.props.value as AccountType] ||
            Currency.CAD;

          setRows((prevRows) =>
            prevRows.map((row) =>
              row.id === params.row.id
                ? { ...row, currency: newCurrency, account: params.props.value }
                : row,
            ),
          );
        }

        return { ...params.props, value: params.props.value };
      },
    },

    {
      field: "description",
      headerName: "Description",
      width: 300,
      editable: true,
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 80,
      type: "string",
      editable: true,
      renderCell: (params) => {
        const isRent = params.row.category === "Rent";
        const isBigExpense = params.value > 100;

        return (
          <div className={!isRent && isBigExpense ? styles.amountBold : ""}>
            ${params.value}
          </div>
        );
      },
      renderEditCell,
    },
    {
      field: "currency",
      headerName: "Cur",
      width: 60,
      type: "singleSelect",
      valueOptions: [Currency.CAD, Currency.USD],
      editable: false,
    },
    {
      field: "category",
      headerName: "Category",
      width: 250,
      type: "singleSelect",
      valueOptions: transformCategoriesForDropdown(categories),
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "",
      width: 80,
      renderHeader: () => {
        if (selectedRows.length > 0) {
          return (
            <GridActionsCellItem
              icon={
                <FontAwesomeIcon
                  icon={faTrash as IconProp}
                  className={styles.icon}
                />
              }
              label="Delete"
              className="textPrimary"
              onClick={handleOpenModal()}
            />
          );
        }
        return null;
      },

      getActions: (params) => {
        const { id } = params.row;

        const isInEditMode = rowModesModel[id]?.mode === "edit";
        const isNewRow = params.row.isNew;

        if (isNewRow) {
          return [
            <GridActionsCellItem
              icon={
                <FontAwesomeIcon
                  icon={faSave as IconProp}
                  className={styles.icon}
                />
              }
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={
                <FontAwesomeIcon
                  icon={faTimes as IconProp}
                  className={styles.icon}
                />
              }
              label="Cancel"
              onClick={handleCancelClick(id)}
            />,
          ];
        }

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={
                <FontAwesomeIcon
                  icon={faSave as IconProp}
                  className={styles.icon}
                />
              }
              label="Save"
              onClick={handleSaveClick(id)}
            />,

            <GridActionsCellItem
              icon={
                <FontAwesomeIcon
                  icon={faPlus as IconProp}
                  className={styles.icon}
                />
              }
              label="Copy"
              onClick={() => createCopyOfThisRow(params.row)}
            />,
            <GridActionsCellItem
              icon={
                <FontAwesomeIcon
                  icon={faTimes as IconProp}
                  className={styles.icon}
                />
              }
              label="Cancel"
              onClick={handleCancelClick(id)}
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={
              <FontAwesomeIcon
                icon={faEdit as IconProp}
                className={styles.icon}
              />
            }
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
          />,

          <GridActionsCellItem
            icon={
              <FontAwesomeIcon
                icon={faTrash as IconProp}
                className={styles.icon}
              />
            }
            label="Delete"
            className="textPrimary"
            onClick={handleOpenModal(id)}
          />,
        ];
      },
    },
  ];
}

export function createSearchColumns({
  handleCheckboxChange,
  categories,
}: {
  handleCheckboxChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => void;
  categories: Category[];
}): GridColDef[] {
  return [
    {
      field: "selection",
      headerName: "",
      type: "boolean",
      width: 70,
      renderCell: (params) => {
        return (
          <Checkbox
            checked={params.value}
            onChange={(event) =>
              handleCheckboxChange(event, params.id as string)
            }
            color="primary"
          />
        );
      },
    },
    {
      field: "datePosted",
      headerName: "Date Posted",
      width: 100,
      editable: false,
      type: "date",
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "account",
      headerName: "Account",
      width: 100,
      type: "singleSelect",
      valueOptions: paymentOptions,
      editable: false,
    },
    {
      field: "description",
      headerName: "Description",
      width: 300,
      editable: false,
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 100,
      type: "number",
      editable: false,
    },
    {
      field: "category",
      headerName: "Category",
      width: 250,
      type: "singleSelect",
      valueOptions: transformCategoriesForDropdown(categories),
      editable: false,
    },
  ];
}
