import { Category } from './features/expenses/ExpensesPage.types';

export const transformCategoriesForDropdown = (categories: Category[]) => {
  return categories.flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      value: subcategory.name,
      label: `${category.name} - ${subcategory.name}`,
    })),
  );
};

// Parses a "yyyy-MM-dd" (or "yyyy-MM-ddTHH:mm:ss...") string into a Date
// representing that local calendar day (avoids the UTC-midnight shift that
// `new Date(string)` would apply).
export const parseLocalDateString = (value: string): Date => {
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Date columns' valueSetter falls back to this when the segmented date editor
// (DateEditCell) commits `null` for an incomplete entry, defaulting to the
// last valid day of the month the row already had.
export const lastDayOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const formatDate = (value: Date | string) => {
  // A Date instance here was built locally (see the datePosted valueGetter) and
  // already represents the intended local calendar day, so read it with local
  // getters. A raw "yyyy-MM-dd" string is parsed as UTC midnight by `new Date`,
  // so it must be read with UTC getters to avoid a timezone-shifted day.
  if (value instanceof Date) {
    const dd = String(value.getDate()).padStart(2, '0');
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const yyyy = value.getFullYear();

    return `${yyyy}/${mm}/${dd}`;
  }

  const valueFormatted = new Date(value);

  const dd = String(valueFormatted.getUTCDate()).padStart(2, '0');
  const mm = String(valueFormatted.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = valueFormatted.getUTCFullYear();

  return `${yyyy}/${mm}/${dd}`;
};
