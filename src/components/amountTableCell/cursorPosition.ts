// Maps a cursor position in a comma-formatted string back to the equivalent
// position in its comma-free (raw) form, i.e. how many non-comma
// characters precede it.
export const rawCursorPosition = (formatted: string, cursorPos: number) => {
  const commasBeforeCursor = (formatted.slice(0, cursorPos).match(/,/g) || []).length;
  return cursorPos - commasBeforeCursor;
};

// Inverse of rawCursorPosition: finds the position in a newly-formatted
// string that has the same number of preceding non-comma characters as
// `rawCursorPos` did in the raw string it was formatted from.
export const formattedCursorPosition = (formatted: string, rawCursorPos: number) => {
  if (rawCursorPos <= 0) return 0;

  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (formatted[i] !== ',') {
      seen++;
    }
    if (seen === rawCursorPos) {
      return i + 1;
    }
  }

  return formatted.length;
};
