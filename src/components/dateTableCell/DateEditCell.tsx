import { useEffect, useRef, useState } from 'react';
import type { GridRenderEditCellParams } from '@mui/x-data-grid';
import {
  clampDayToMonth,
  clampSegment,
  dateToSegments,
  daysInMonth,
  pad2,
  segmentsToDate,
  type Segments,
} from './dateSegments';
import styles from './DateTableCell.module.css';

// A controlled MM/DD/YYYY editor that replaces the grid's default native
// <input type="date"> for date columns. The native control clamps the month
// segment to its own static 1-12 range as you type (13 -> 12) but can't do
// the equivalent for day, since a valid day depends on the month/year next
// to it (1-31 is the day segment's own static range) — so typing 31 in
// September just leaves the whole control blank/invalid instead of
// clamping to 30. This component applies the same clamp-as-you-type
// behavior to both segments.
export function DateEditCell(params: GridRenderEditCellParams) {
  const { id, field, value, api, hasFocus } = params;
  const [segments, setSegments] = useState<Segments>(() => dateToSegments(value));

  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasFocus) {
      monthRef.current?.focus();
      monthRef.current?.select();
    }
  }, [hasFocus]);

  const commit = (next: Segments, event: React.SyntheticEvent) => {
    setSegments(next);
    api.setEditCellValue({ id, field, value: segmentsToDate(next) }, event);
  };

  const referenceYear = (next: Segments) =>
    next.year.length === 4 ? Number(next.year) : new Date().getFullYear();

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 2);
    const { value: month, complete } = clampSegment(digits, 12);

    let next: Segments = { ...segments, month };
    if (month.length === 2 && next.day.length === 2) {
      next = {
        ...next,
        day: pad2(clampDayToMonth(Number(next.day), referenceYear(next), Number(month))),
      };
    }

    commit(next, event);
    if (complete) dayRef.current?.focus();
  };

  const handleDayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 2);
    const maxDay =
      segments.month.length === 2
        ? daysInMonth(referenceYear(segments), Number(segments.month))
        : 31;
    const { value: day, complete } = clampSegment(digits, maxDay);

    commit({ ...segments, day }, event);
    if (complete) yearRef.current?.focus();
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
    let next: Segments = { ...segments, year: digits };
    if (digits.length === 4 && next.month.length === 2 && next.day.length === 2) {
      next = {
        ...next,
        day: pad2(clampDayToMonth(Number(next.day), Number(digits), Number(next.month))),
      };
    }
    commit(next, event);
  };

  const focusSegment = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.focus();
    ref.current?.select();
  };

  // Mirrors the native <input type="date"> control's own Left/Right arrow
  // behavior, which jumps between the month/day/year segments (each fully
  // highlighted on entry) rather than moving a text cursor within one.
  const handleMonthKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusSegment(dayRef);
    }
  };

  const handleDayKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && segments.day === '') {
      event.preventDefault();
      focusSegment(monthRef);
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusSegment(monthRef);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusSegment(yearRef);
    }
  };

  const handleYearKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && segments.year === '') {
      event.preventDefault();
      focusSegment(dayRef);
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusSegment(dayRef);
    }
  };

  return (
    <div className={styles.container}>
      <input
        ref={monthRef}
        className={styles.segment}
        style={{ width: '2ch' }}
        inputMode="numeric"
        placeholder="mm"
        maxLength={2}
        value={segments.month}
        onChange={handleMonthChange}
        onFocus={(event) => event.target.select()}
        onKeyDown={handleMonthKeyDown}
      />
      <span className={styles.separator}>/</span>
      <input
        ref={dayRef}
        className={styles.segment}
        style={{ width: '2ch' }}
        inputMode="numeric"
        placeholder="dd"
        maxLength={2}
        value={segments.day}
        onChange={handleDayChange}
        onFocus={(event) => event.target.select()}
        onKeyDown={handleDayKeyDown}
      />
      <span className={styles.separator}>/</span>
      <input
        ref={yearRef}
        className={styles.segment}
        style={{ width: '4ch' }}
        inputMode="numeric"
        placeholder="yyyy"
        maxLength={4}
        value={segments.year}
        onChange={handleYearChange}
        onFocus={(event) => event.target.select()}
        onKeyDown={handleYearKeyDown}
      />
    </div>
  );
}
