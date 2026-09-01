import { Currency } from './helpers';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { faTrash, faSave, faEdit, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { formatDate, transformCategoriesForDropdown } from '../../utils';
import type { TableColumns } from './ExpensesPage.types';
import { Checkbox } from '@mui/material';
import styles from './ExpensesPage.module.css';
import type { Data } from '../../services/expenses/expensesApi.types';
import { v4 as uuidv4 } from 'uuid';
import { renderEditCell } from '../../components/amountTableCell/AmountTableCell';
import { iconAction, createRowModeHandlers } from './gridActions';

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
  budgetByCategory,
  accounts,
}: TableColumns): GridColDef[] {
  const { handleEditClick, handleSaveClick, handleCancelClick } = createRowModeHandlers<Data>({
    rowModesModel,
    setRowModesModel,
    rows,
    setRows,
  });

  const createCopyOfThisRow = (row: Data) => {
    const newRow = { ...row, id: uuidv4(), isNew: true, description: `${row.description} (copy)` };

    setRows((currentRows) => {
      const rowIndex = currentRows.findIndex((r) => r.id === row.id);
      if (rowIndex === -1) return currentRows;
      const newRows = [...currentRows];
      newRows.splice(rowIndex + 1, 0, newRow);
      return newRows;
    });
  };

  const buildRowActions = (params: GridRowParams) => {
    const { id } = params.row;
    const isInEditMode = rowModesModel[id]?.mode === 'edit';

    if (params.row.isNew) {
      return [
        iconAction({ icon: faSave, label: 'Save', onClick: handleSaveClick(id) }),
        iconAction({ icon: faTimes, label: 'Cancel', onClick: handleCancelClick(id) }),
      ];
    }

    if (isInEditMode) {
      return [
        iconAction({ icon: faSave, label: 'Save', onClick: handleSaveClick(id) }),
        iconAction({ icon: faPlus, label: 'Copy', onClick: () => createCopyOfThisRow(params.row) }),
        iconAction({ icon: faTimes, label: 'Cancel', onClick: handleCancelClick(id) }),
      ];
    }

    return [
      iconAction({ icon: faEdit, label: 'Edit', primary: true, onClick: handleEditClick(id) }),
      iconAction({ icon: faTrash, label: 'Delete', primary: true, onClick: handleOpenModal(id) }),
    ];
  };

  return [
    {
      field: 'selection',
      sortable: false,
      headerName: '',
      disableColumnMenu: true,
      type: 'boolean',
      width: 60,
      renderCell: (params) => (
        <Checkbox
          checked={params.value || selectedRows.includes(params.row)}
          onChange={(event) => handleCheckboxChange(event, params.id as string)}
          color="primary"
        />
      ),
      renderHeader: () => <Checkbox onChange={handleHeaderCheckboxChange} color="primary" />,
    },
    {
      field: 'datePosted',
      headerName: 'Date Posted',
      width: 100,
      editable: true,
      type: 'date',
      valueGetter: (value: Date | string | null) => {
        if (!value) return value;
        if (value instanceof Date) return value;
        const datePart = value.slice(0, 10);
        const [year, month, day] = datePart.split('-').map(Number);
        return new Date(year, month - 1, day);
      },
      valueSetter: (value: Date, row: Data) => {
        const yyyy = value.getFullYear();
        const mm = String(value.getMonth() + 1).padStart(2, '0');
        const dd = String(value.getDate()).padStart(2, '0');
        return { ...row, datePosted: `${yyyy}-${mm}-${dd}` };
      },
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: 'account',
      headerName: 'Account',
      width: 95,
      type: 'singleSelect',
      valueOptions: accounts.map((account) => account.name),
      editable: true,
      preProcessEditCellProps: (params) => {
        if (params.row.isNew) {
          const newCurrency =
            accounts.find((account) => account.name === params.props.value)?.currency ||
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
      field: 'description',
      headerName: 'Description',
      width: 300,
      editable: true,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 80,
      type: 'string',
      editable: true,
      renderCell: (params) => {
        const budget = budgetByCategory[params.row.category as string];
        const isOverBudget = budget !== undefined && params.value > budget;
        return <div className={isOverBudget ? styles.amountBold : ''}>${params.value}</div>;
      },
      renderEditCell,
    },
    {
      field: 'currency',
      headerName: 'Cur',
      width: 60,
      type: 'singleSelect',
      valueOptions: [Currency.CAD, Currency.USD],
      editable: false,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 250,
      type: 'singleSelect',
      valueOptions: transformCategoriesForDropdown(categories),
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 80,
      renderHeader: () =>
        selectedRows.length > 0
          ? iconAction({
              icon: faTrash,
              label: 'Delete',
              primary: true,
              onClick: handleOpenModal(),
            })
          : null,
      getActions: buildRowActions,
    },
  ];
}
