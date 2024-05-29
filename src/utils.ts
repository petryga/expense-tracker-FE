import { GridValueFormatterParams } from '@mui/x-data-grid';
import { Category } from './features/expenses/ExpensesPage.types';

export const transformCategoriesForDropdown = (categories: Category[]) => {
  return categories.flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      value: subcategory.name,
      label: `${category.name} - ${subcategory.name}`,
    }))
  );
};

export const formatDate = (date: GridValueFormatterParams) => {
  const valueFormatted = date.value instanceof Date ? date.value : new Date(date.value);

  const dd = String(valueFormatted.getUTCDate()).padStart(2, '0');
  const mm = String(valueFormatted.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = valueFormatted.getUTCFullYear();

  return `${yyyy}/${mm}/${dd}`;
};
