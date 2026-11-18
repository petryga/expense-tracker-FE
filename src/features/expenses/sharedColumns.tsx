import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import styles from './DescriptionCell.module.css';
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

// The description, with a small tag for every expense that has a merchant, so
// a tagged expense always looks tagged, even when its description names the merchant.
export const showsMerchantTag = (merchant: string | null | undefined) => !!merchant?.trim();

export const renderDescription = (params: GridRenderCellParams) => {
  const description = String(params.value ?? '');
  const merchant = params.row.merchant as string | null | undefined;
  return (
    <span className={styles.cell}>
      <span className={styles.text}>{description}</span>
      {showsMerchantTag(merchant) && (
        <span className={styles.tag} title={`Bought on ${merchant}`}>
          {merchant}
        </span>
      )}
    </span>
  );
};
