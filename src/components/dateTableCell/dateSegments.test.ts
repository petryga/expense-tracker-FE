import { describe, expect, it } from 'vitest';
import {
  clampDayToMonth,
  clampSegment,
  dateToSegments,
  daysInMonth,
  pad2,
  segmentsToDate,
} from './dateSegments';

describe('daysInMonth', () => {
  it('returns 30 for September', () => {
    expect(daysInMonth(2026, 9)).toBe(30);
  });

  it('returns 31 for months with 31 days', () => {
    expect(daysInMonth(2026, 7)).toBe(31);
  });

  it('returns 28 for February in a non-leap year', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
  });

  it('returns 29 for February in a leap year', () => {
    expect(daysInMonth(2028, 2)).toBe(29);
  });
});

describe('clampSegment (month, max 12)', () => {
  it('keeps a single digit that could still extend to a valid month (1 -> 10/11/12)', () => {
    expect(clampSegment('1', 12)).toEqual({ value: '1', complete: false });
  });

  it('keeps a single digit "0" waiting for a second digit (01-09)', () => {
    expect(clampSegment('0', 12)).toEqual({ value: '0', complete: false });
  });

  it('immediately completes and pads a single digit that cannot extend (2 -> 02, since 20-29 is never a valid month)', () => {
    expect(clampSegment('2', 12)).toEqual({ value: '02', complete: true });
  });

  it('immediately completes a single digit 9 as 09', () => {
    expect(clampSegment('9', 12)).toEqual({ value: '09', complete: true });
  });

  it('clamps 13 down to 12', () => {
    expect(clampSegment('13', 12)).toEqual({ value: '12', complete: true });
  });

  it('passes through a valid two-digit month unchanged', () => {
    expect(clampSegment('11', 12)).toEqual({ value: '11', complete: true });
  });

  it('clamps 00 up to 01 (no zero month)', () => {
    expect(clampSegment('00', 12)).toEqual({ value: '01', complete: true });
  });
});

describe('clampSegment (day, dynamic max)', () => {
  it('clamps 31 down to 30 for a 30-day month (September)', () => {
    expect(clampSegment('31', 30)).toEqual({ value: '30', complete: true });
  });

  it('keeps 3 open for September (max 30) since 30-39 could still resolve to 30', () => {
    expect(clampSegment('3', 30)).toEqual({ value: '3', complete: false });
  });

  it('immediately clamps 4 to 04 for September (40-49 is never valid)', () => {
    expect(clampSegment('4', 30)).toEqual({ value: '04', complete: true });
  });

  it('clamps 30 down to 28 for February in a non-leap year', () => {
    expect(clampSegment('30', 28)).toEqual({ value: '28', complete: true });
  });

  it('clamps 30 down to 29 for February in a leap year', () => {
    expect(clampSegment('30', 29)).toEqual({ value: '29', complete: true });
  });

  it('passes through a valid two-digit day unchanged', () => {
    expect(clampSegment('15', 31)).toEqual({ value: '15', complete: true });
  });
});

describe('clampDayToMonth', () => {
  it('re-clamps an existing day of 30 down to 28 when the month changes to February', () => {
    expect(clampDayToMonth(30, 2026, 2)).toBe(28);
  });

  it('re-clamps an existing day of 30 down to 29 in a leap year February', () => {
    expect(clampDayToMonth(30, 2028, 2)).toBe(29);
  });

  it('leaves a valid day unchanged', () => {
    expect(clampDayToMonth(15, 2026, 9)).toBe(15);
  });

  it('leaves day 30 unchanged for a 30-day month', () => {
    expect(clampDayToMonth(30, 2026, 9)).toBe(30);
  });
});

describe('pad2', () => {
  it('pads a single digit with a leading zero', () => {
    expect(pad2(5)).toBe('05');
  });

  it('leaves a two-digit number unchanged', () => {
    expect(pad2(13)).toBe('13');
  });
});

describe('dateToSegments', () => {
  it('splits a Date into zero-padded month/day/year strings', () => {
    expect(dateToSegments(new Date(2026, 8, 5))).toEqual({
      month: '09',
      day: '05',
      year: '2026',
    });
  });

  it('returns empty segments for null', () => {
    expect(dateToSegments(null)).toEqual({ month: '', day: '', year: '' });
  });

  it('returns empty segments for an Invalid Date', () => {
    expect(dateToSegments(new Date('not-a-date'))).toEqual({
      month: '',
      day: '',
      year: '',
    });
  });

  it('returns empty segments for a non-Date value', () => {
    expect(dateToSegments('2026-09-05')).toEqual({ month: '', day: '', year: '' });
  });
});

describe('segmentsToDate', () => {
  it('builds a local Date once all three segments are complete', () => {
    const result = segmentsToDate({ month: '09', day: '05', year: '2026' });

    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(8);
    expect(result?.getDate()).toBe(5);
  });

  it('returns null when the month is incomplete', () => {
    expect(segmentsToDate({ month: '9', day: '05', year: '2026' })).toBeNull();
  });

  it('returns null when the day is incomplete', () => {
    expect(segmentsToDate({ month: '09', day: '', year: '2026' })).toBeNull();
  });

  it('returns null when the year is incomplete', () => {
    expect(segmentsToDate({ month: '09', day: '05', year: '202' })).toBeNull();
  });

  it('returns null for entirely empty segments', () => {
    expect(segmentsToDate({ month: '', day: '', year: '' })).toBeNull();
  });
});
