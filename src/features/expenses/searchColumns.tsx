import type { GridColDef } from '@mui/x-data-grid';
import { Checkbox } from '@mui/material';
import { formatAmount, formatDate, transformCategoriesForDropdown } from '../../utils';
import { Currency } from './helpers';
import type { Category } from './ExpensesPage.types';
import type { AccountRecord } from '../../services/accounts/accountsApi.types';

/** Read-only column set for the search results grid. */
export function createSearchColumns({
  handleCheckboxChange,
  categories,
  accounts,
}: {
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  categories: Category[];
  accounts: AccountRecord[];
}): GridColDef[] {
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
      headerName: 'Date Posted',
      width: 100,
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
      editable: false,
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 300,
      editable: false,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
      type: 'number',
      editable: false,
      renderCell: (params) => <div>${formatAmount(params.value)}</div>,
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
      editable: false,
    },
  ];
}
