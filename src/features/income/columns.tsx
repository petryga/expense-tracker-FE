import type { GridColDef } from '@mui/x-data-grid';
import { faTrash, faSave, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
import { formatDate, lastDayOfMonth, parseLocalDateString } from '../../utils';
import { TableColumns } from './AssetsPage.types';
import { IncomeCategories } from './helpers';
import { renderEditCell } from '../../components/amountTableCell/AmountTableCell';
import { renderEditCell as renderDateEditCell } from '../../components/dateTableCell/DateTableCell';
import Checkbox from '@mui/material/Checkbox';
import { Currency } from '../expenses/helpers';
import { iconAction, createRowModeHandlers } from '../expenses/gridActions';
import type { IncomeData } from '../../services/income/incomeApi.types';

export function createTableColumns({
  rowModesModel,
  setRowModesModel,
  rows,
  setRows,
  handleOpenModal,
  handleCheckboxChange,
  handleHeaderCheckboxChange,
  selectedRows,
}: TableColumns): GridColDef[] {
  const { handleEditClick, handleSaveClick, handleCancelClick } = createRowModeHandlers<IncomeData>(
    {
      rowModesModel,
      setRowModesModel,
      rows,
      setRows,
    },
  );

  return [
    {
      field: 'selection',
      sortable: false,
      headerName: '',
      disableColumnMenu: true,
      type: 'boolean',
      width: 70,
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
      field: 'date',
      headerName: 'Date',
      width: 120,
      editable: true,
      type: 'date',
      renderEditCell: renderDateEditCell,
      valueGetter: (value: Date | string | null) => {
        if (!value) return value;
        if (value instanceof Date) return value;
        return parseLocalDateString(value);
      },
      valueSetter: (value: Date | null, row: IncomeData) => {
        const date =
          value ?? lastDayOfMonth(row.date ? parseLocalDateString(row.date) : new Date());
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return { ...row, date: `${yyyy}-${mm}-${dd}` };
      },
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 350,
      editable: true,
      type: 'singleSelect',
      valueOptions: [
        { value: IncomeCategories.BANK_ACCOUNTS, label: 'Bank Accounts' },
        { value: IncomeCategories.CRYPTO, label: 'Crypto' },
        { value: IncomeCategories.INVESTMENTS, label: 'Investments' },
        { value: IncomeCategories.CASH, label: 'Cash' },
      ],
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
      type: 'string',
      editable: true,
      renderCell: (params) => `$${params.value}`,
      renderEditCell,
    },
    {
      field: 'currency',
      headerName: 'Cur',
      width: 100,
      type: 'singleSelect',
      valueOptions: [Currency.CAD, Currency.USD],
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 100,
      getActions: (params) => {
        const { id } = params.row;
        const isInEditMode = rowModesModel[id]?.mode === 'edit';

        if (isInEditMode) {
          return [
            iconAction({ icon: faSave, label: 'Save', onClick: handleSaveClick(id) }),
            iconAction({ icon: faTimes, label: 'Cancel', onClick: handleCancelClick(id) }),
          ];
        }

        return [
          iconAction({ icon: faEdit, label: 'Edit', primary: true, onClick: handleEditClick(id) }),
          iconAction({
            icon: faTrash,
            label: 'Delete',
            primary: true,
            onClick: handleOpenModal(id),
          }),
        ];
      },
    },
  ];
}
