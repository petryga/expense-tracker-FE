// Pure logic for the segmented MM/DD/YYYY date editor (DateTableCell). Kept
// separate from the component so it can be unit tested directly (this repo's
// FE tests only cover pure logic, not rendered components).

export const daysInMonth = (year: number, month: number): number =>
  // Day 0 of "next month" is the last day of "month" (1-12 here, matching
  // calendar convention rather than JS Date's 0-indexed months).
  new Date(year, month, 0).getDate();

export type SegmentClampResult = {
  // The (possibly clamped) digits to display in the segment, zero-padded
  // once the segment is complete.
  value: string;
  // True once the segment can't accept another digit — either because it
  // has 2 digits, or because no possible second digit would keep the value
  // within [1, max] (e.g. typing "4" for a day when the month tops out at
  // 30 can only ever mean day 4 — 40-49 is never valid).
  complete: boolean;
};

// Mirrors the native <input type="date"> month segment's own behavior
// (typing "13" for month clamps to 12) but applied uniformly, with a
// caller-supplied `max` so the same logic clamps the day segment to
// whatever the currently selected month/year actually allows (e.g. 30 for
// September, 28/29 for February) instead of the day field's static 1-31
// range that lets an impossible day (like the 31st in September) through.
export const clampSegment = (digits: string, max: number): SegmentClampResult => {
  const num = Number(digits);

  if (digits.length < 2 && num * 10 <= max) {
    return { value: digits, complete: false };
  }

  const clamped = Math.min(Math.max(num, 1), max);
  return { value: String(clamped).padStart(2, '0'), complete: true };
};

// Re-clamps an already-complete day against a newly changed month/year
// (e.g. day was 30, month changes to February -> 28 or 29).
export const clampDayToMonth = (day: number, year: number, month: number): number =>
  Math.min(day, daysInMonth(year, month));

export type Segments = { month: string; day: string; year: string };

export const EMPTY_SEGMENTS: Segments = { month: '', day: '', year: '' };

export const pad2 = (value: number) => String(value).padStart(2, '0');

export const dateToSegments = (value: unknown): Segments => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      month: pad2(value.getMonth() + 1),
      day: pad2(value.getDate()),
      year: String(value.getFullYear()),
    };
  }
  return EMPTY_SEGMENTS;
};

// Only a fully-typed MM/DD/YYYY resolves to a Date — an in-progress edit
// (e.g. year not yet 4 digits) commits as `null`, letting the datePosted /
// date column's valueSetter fall back to the last valid day of whatever
// month the row already had.
export const segmentsToDate = ({ month, day, year }: Segments): Date | null => {
  if (month.length < 2 || day.length < 2 || year.length < 4) return null;
  return new Date(Number(year), Number(month) - 1, Number(day));
};
