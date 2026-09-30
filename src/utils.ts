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

// Inserts thousands-separator commas into a number's integer part for
// display, e.g. 1234.5 -> "1,234.5". Leaves non-numeric strings (like an
// in-progress arithmetic expression in the amount edit cell) untouched.
export const formatNumberWithCommas = (value: number | string): string => {
  const stringValue = typeof value === 'number' ? value.toString() : value;
  if (!/^-?\d*\.?\d*$/.test(stringValue) || stringValue === '' || stringValue === '-') {
    return stringValue;
  }

  const [integerPart, decimalPart] = stringValue.split('.');
  const negative = integerPart.startsWith('-');
  const digits = negative ? integerPart.slice(1) : integerPart;
  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = negative ? '-' : '';

  return decimalPart !== undefined ? `${sign}${withCommas}.${decimalPart}` : `${sign}${withCommas}`;
};

// Strips the commas formatNumberWithCommas adds back out, e.g. so a
// formatted amount can be parsed back into a plain number.
export const stripCommas = (value: string): string => value.replace(/,/g, '');

// Removes a redundant leading zero as the user types over a "0" placeholder
// amount, e.g. typing "5" into a field showing "0" would otherwise leave
// "05" -- this corrects it to "5" immediately. A lone "0", or a "0"
// immediately followed by a decimal point (e.g. "0.5"), is left alone.
export const stripLeadingZero = (value: string): string => value.replace(/^(-?)0+(?=\d)/, '$1');

// Formats a monetary amount for display: up to 2 decimals with thousands
// separators, dropping a trailing ".00" or trailing zero, e.g.
// 1234 -> "1,234", 1234.5 -> "1,234.5", 1234.56 -> "1,234.56".
export const formatAmount = (value: number | null | undefined): string => {
  const amount = Number(value) || 0;
  const trimmed = amount.toFixed(2).replace(/\.?0+$/, '');
  return formatNumberWithCommas(trimmed);
};

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
