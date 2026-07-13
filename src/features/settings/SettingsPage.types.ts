import { GridRowId, GridRowModes } from '@mui/x-data-grid';
import { Dispatch, SetStateAction } from 'react';
import type { RecurringExpenseData } from '../../services/recurringExpenses/recurringExpensesApi.types';
import type { RecurringIncomeData } from '../../services/recurringIncome/recurringIncomeApi.types';
import type { Category } from '../expenses/ExpensesPage.types';
import type { AccountRecord } from '../../services/accounts/accountsApi.types';

export type RecurringExpenseTableColumns = {
  rowModesModel: Record<GridRowId, { mode: GridRowModes }>;
  setRowModesModel: (
    model: Record<GridRowId, { mode: GridRowModes; ignoreModifications?: boolean }>
  ) => void;
  rows?: RecurringExpenseData[];
  setRows: Dispatch<SetStateAction<RecurringExpenseData[]>>;
  handleOpenModal: (id: GridRowId) => () => void;
  categories: Category[];
  accounts: AccountRecord[];
};

export type RecurringIncomeTableColumns = {
  rowModesModel: Record<GridRowId, { mode: GridRowModes }>;
  setRowModesModel: (
    model: Record<GridRowId, { mode: GridRowModes; ignoreModifications?: boolean }>
  ) => void;
  rows?: RecurringIncomeData[];
  setRows: Dispatch<SetStateAction<RecurringIncomeData[]>>;
  handleOpenModal: (id: GridRowId) => () => void;
};
