import { useLayoutEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import { GridRenderEditCellParams } from '@mui/x-data-grid';
import { formatNumberWithCommas, stripCommas, stripLeadingZero } from '../../utils';
import { evaluateExpression } from './evaluateExpression';
import { formattedCursorPosition, rawCursorPosition } from './cursorPosition';

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

// Amount edit cell for the expenses/income/recurring grids. The value
// committed to the grid (and sent to the API) stays a plain, comma-free
// number/expression string -- commas are purely a display mask applied as
// the user types, so they never leak into evaluateExpression or the saved
// amount.
export function AmountEditCell(params: GridRenderEditCellParams) {
  const { id, field, value, api } = params;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingCursorRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingCursorRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(pendingCursorRef.current, pendingCursorRef.current);
      pendingCursorRef.current = null;
    }
  });

  const displayValue = formatNumberWithCommas(String(value ?? ''));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const commaFreeInput = stripCommas(input.value);
    const rawInput = stripLeadingZero(commaFreeInput);
    const droppedLeadingChars = commaFreeInput.length - rawInput.length;
    const cursorPos = input.selectionStart ?? input.value.length;
    const nextDisplay = formatNumberWithCommas(rawInput);

    const rawCursorPos = Math.max(
      0,
      rawCursorPosition(input.value, cursorPos) - droppedLeadingChars,
    );
    pendingCursorRef.current = formattedCursorPosition(nextDisplay, rawCursorPos);

    api.setEditCellValue({ id, field, value: rawInput }, event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      const result = evaluateExpression(target.value);
      const formattedResult: number = isNaN(result) ? result : parseFloat(result);
      api.setEditCellValue(
        {
          id,
          field,
          value: formattedResult.toFixed(2),
        },
        event,
      );
    }
  };

  return (
    <TextField
      inputRef={inputRef}
      fullWidth
      type="text"
      variant="standard"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      sx={textFieldStyles}
    />
  );
}
