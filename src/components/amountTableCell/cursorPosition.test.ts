import { describe, expect, it } from 'vitest';
import { formattedCursorPosition, rawCursorPosition } from './cursorPosition';

describe('rawCursorPosition', () => {
  it('is unchanged when there are no commas before the cursor', () => {
    expect(rawCursorPosition('123', 2)).toBe(2);
  });

  it('subtracts one comma before the cursor', () => {
    expect(rawCursorPosition('1,234', 3)).toBe(2);
  });

  it('subtracts multiple commas before the cursor', () => {
    expect(rawCursorPosition('1,234,567', 7)).toBe(5);
  });

  it('ignores commas after the cursor', () => {
    expect(rawCursorPosition('1,234,567', 1)).toBe(1);
  });
});

describe('formattedCursorPosition', () => {
  it('returns 0 for a cursor at (or before) the start', () => {
    expect(formattedCursorPosition('1,234', 0)).toBe(0);
    expect(formattedCursorPosition('1,234', -1)).toBe(0);
  });

  it('skips over an inserted comma', () => {
    expect(formattedCursorPosition('1,234', 2)).toBe(3);
  });

  it('skips over multiple inserted commas', () => {
    expect(formattedCursorPosition('1,234,567', 5)).toBe(7);
  });

  it('clamps to the end when the raw position exceeds the string length', () => {
    expect(formattedCursorPosition('1,234', 10)).toBe(5);
  });

  it('round-trips with rawCursorPosition for a value with no commas', () => {
    const formatted = '1234+5';
    const cursorPos = 4;
    const raw = rawCursorPosition(formatted, cursorPos);
    expect(formattedCursorPosition(formatted, raw)).toBe(cursorPos);
  });
});
