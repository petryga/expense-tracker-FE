import { GridRenderEditCellParams } from '@mui/x-data-grid';
import { AmountEditCell } from './AmountEditCell';

export { evaluateExpression } from './evaluateExpression';

export const renderEditCell = (params: GridRenderEditCellParams) => <AmountEditCell {...params} />;
