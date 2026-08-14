import { createContext } from 'react';

// Kept in its own module so CustomFooter.tsx only exports components, which is
// what react-refresh/only-export-components requires for fast refresh to work.
export const Context = createContext<{
  totalSelectedCad: number | null;
  totalSelectedUsd: number | null;
  expensesTotalAmountCad?: number;
  expensesTotalAmountUsd?: number;
} | null>(null);
