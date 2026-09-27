import type { GridRenderEditCellParams } from '@mui/x-data-grid';
import { DateEditCell } from './DateEditCell';

export const renderEditCell = (params: GridRenderEditCellParams) => <DateEditCell {...params} />;
