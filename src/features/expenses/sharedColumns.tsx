import type { GridColDef } from '@mui/x-data-grid';
import { transformCategoriesForDropdown } from '../../utils';
import type { Category } from './ExpensesPage.types';

// Columns the expenses grid and the search results share, so both edit and
// show expenses the same way.

export const giftColumn = (): GridColDef => ({
  // A gift keeps its real category; reports count it under Gifts.
  field: 'isGift',
  headerName: 'Gift',
  width: 60,
  type: 'boolean',
  editable: true,
  // A tick on gifts only; no cross on every other row.
  renderCell: (params) => (params.value ? '✓' : ''),
});

export const categoryColumn = (categories: Category[]): GridColDef => {
  const options = transformCategoriesForDropdown(categories);
  return {
    field: 'category',
    headerName: 'Category',
    width: 250,
    type: 'singleSelect',
    valueOptions: options,
    editable: true,
    // A category that isn't in the list (e.g. "Uncategorized" on gifts moved
    // out of the old Gifts category) still shows, so it can be found and fixed.
    renderCell: (params) =>
      options.find((o) => o.value === params.value)?.label ?? params.value ?? '',
  };
};
