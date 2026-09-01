import { GridRowId, GridRowModes } from '@mui/x-data-grid';
import { Dispatch, SetStateAction } from 'react';
import type { IncomeData } from '../../services/income/incomeApi.types';

export type TableColumns = {
  rowModesModel: Record<GridRowId, { mode: GridRowModes }>;
  setRowModesModel: (
    model: Record<GridRowId, { mode: GridRowModes; ignoreModifications?: boolean }>,
  ) => void;
  rows?: IncomeData[];
  setRows: Dispatch<SetStateAction<IncomeData[]>>;
  handleOpenModal: (id: GridRowId) => () => void;
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  handleHeaderCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedRows: IncomeData[];
};
