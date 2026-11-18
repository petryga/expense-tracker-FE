import type { Dispatch, SetStateAction } from 'react';
import type { GridColDef, GridRowModesModel, GridRowParams } from '@mui/x-data-grid';
import { Checkbox } from '@mui/material';
import { faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { formatAmount, formatDate } from '../../utils';
import { renderEditCell } from '../../components/amountTableCell/AmountTableCell';
import { Currency } from './helpers';
import { createRowModeHandlers, iconAction } from './gridActions';
import { categoryColumn, giftColumn, renderDescription } from './sharedColumns';
import type { Category } from './ExpensesPage.types';
import type { AccountRecord } from '../../services/accounts/accountsApi.types';
import type { Data } from '../../services/expenses/expensesApi.types';

/**
 * Columns for the search results grid. Rows are edited like in the expenses
 * grid (pencil, then save or cancel); the date stays read-only here, since
 * moving an expense to another month is done from that month's view.
 */
export function createSearchColumns({
  handleCheckboxChange,
  categories,
  accounts,
  rowModesModel,
  setRowModesModel,
  rows,
  setRows,
}: {
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  categories: Category[];
  accounts: AccountRecord[];
  rowModesModel: GridRowModesModel;
  setRowModesModel: Dispatch<SetStateAction<GridRowModesModel>>;
  rows: Data[];
  setRows: Dispatch<SetStateAction<Data[]>>;
}): GridColDef[] {
  const { handleEditClick, handleSaveClick, handleCancelClick } = createRowModeHandlers<Data>({
    rowModesModel,
    setRowModesModel,
    rows,
    setRows,
  });

  return [
    {
      field: 'selection',
      headerName: '',
      type: 'boolean',
      width: 70,
      renderCell: (params) => (
        <Checkbox
          checked={params.value}
          onChange={(event) => handleCheckboxChange(event, params.id as string)}
          color="primary"
        />
      ),
    },
    {
      field: 'datePosted',
      headerName: 'Date',
      width: 84,
      editable: false,
      type: 'date',
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: 'account',
      headerName: 'Account',
      width: 100,
      type: 'singleSelect',
      valueOptions: accounts.map((account) => account.name),
      editable: true,
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 300,
      editable: true,
      renderCell: renderDescription,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
      type: 'string',
      editable: true,
      renderCell: (params) => <div>${formatAmount(params.value)}</div>,
      renderEditCell,
    },
    {
      field: 'currency',
      headerName: 'Cur',
      width: 60,
      type: 'singleSelect',
      valueOptions: [Currency.CAD, Currency.USD],
      editable: true,
    },
    giftColumn(),
    categoryColumn(categories),
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 80,
      getActions: ({ id }: GridRowParams) =>
        rowModesModel[id]?.mode === 'edit'
          ? [
              iconAction({ icon: faSave, label: 'Save', onClick: handleSaveClick(id) }),
              iconAction({ icon: faTimes, label: 'Cancel', onClick: handleCancelClick(id) }),
            ]
          : [
              iconAction({
                icon: faEdit,
                label: 'Edit',
                primary: true,
                onClick: handleEditClick(id),
              }),
            ],
    },
  ];
}
