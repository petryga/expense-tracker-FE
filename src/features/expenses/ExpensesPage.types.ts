import {
  GridRowModesModel,
  GridPaginationModel,
  GridSortModel,
  GridRowId,
  GridRowModes,
  GridFilterModel,
} from '@mui/x-data-grid';
import { Dispatch, SetStateAction } from 'react';
import type { Data } from '../../services/expenses/expensesApi.types';
import type { AccountRecord } from '../../services/accounts/accountsApi.types';

export type Category = {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
};

export type DataByCategory = {
  category: string;
  total: number;
  fill?: string;
  details: { description: string; amount: number; currency: string }[];
  budget: number | null;
};

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
export interface EditToolbarProps {
  setRows: Dispatch<SetStateAction<Data[]>>;
  setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
  onAddButtonClick: () => void;
  onAddRecurringButtonClick: () => void;
  filterModel: GridFilterModel;
  recurringDisabled?: boolean;
  accounts: AccountRecord[];
}

export interface QueryOptions {
  pageModel: GridPaginationModel;
  sortModel: GridSortModel;
  searchTerm: string;
  rowCount: number;
}

export type ContentComponentProps = {
  rows: Data[] | undefined;
  setRows: Dispatch<SetStateAction<Data[]>>;
};

export type TableColumns = {
  rowModesModel: Record<GridRowId, { mode: GridRowModes }>;
  setRowModesModel: (
    model: Record<GridRowId, { mode: GridRowModes; ignoreModifications?: boolean }>
  ) => void;
  rows?: Data[];
  setRows: Dispatch<SetStateAction<Data[]>>;
  handleOpenModal: (id?: GridRowId) => () => void;
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  handleHeaderCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedRows: Data[];
  categories: Category[];
  budgetByCategory: Record<string, number>;
  accounts: AccountRecord[];
};
