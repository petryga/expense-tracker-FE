import { formatAmount } from '../../utils';

// Same look as the "Add entry" toolbar buttons elsewhere in the app.
export const goldButton = {
  fontWeight: 'bold',
  ':hover': { backgroundColor: 'var(--surface-subtle)', color: 'var(--text-muted)' },
};

// Signed cents as the app shows amounts: "$1,204.1", "-$24.99".
export const money = (cents: number) =>
  `${cents < 0 ? '-' : ''}$${formatAmount(Math.abs(cents) / 100)}`;
