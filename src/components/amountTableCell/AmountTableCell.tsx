import TextField from '@mui/material/TextField';
import { GridRenderEditCellParams } from '@mui/x-data-grid';

const textFieldStyles = {
  "& input[type='number']::-webkit-inner-spin-button, & input[type='number']::-webkit-outer-spin-button":
    {
      WebkitAppearance: 'none',
      margin: 0,
    },
  '& .MuiInput-root::before': {
    content: 'none',
  },
  '& .MuiInput-root::after': {
    content: 'none',
  },
};

export const evaluateExpression = (expression: string) => {
  try {
    return new Function('return (' + expression + ')')();
  } catch (error) {
    console.error('Error evaluating expression:', error);
    return expression;
  }
};

export const renderEditCell = (params: GridRenderEditCellParams) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      const result = evaluateExpression(target.value);
      const formattedResult: number = isNaN(result) ? result : parseFloat(result);
      params.api.setEditCellValue(
        {
          id: params.id,
          field: params.field,
          value: formattedResult.toFixed(2),
        },
        event,
      );
    }
  };

  return (
    <TextField
      fullWidth
      type="text"
      variant="standard"
      value={params.value || ''}
      onChange={(event) => {
        params.api.setEditCellValue(
          {
            id: params.id,
            field: params.field,
            value: event.target.value,
          },
          event,
        );
      }}
      onKeyDown={handleKeyDown}
      sx={textFieldStyles}
    />
  );
};
