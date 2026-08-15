// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useSyncedRows } from './useSyncedRows';

afterEach(cleanup);

interface Row {
  id: string;
}

describe('useSyncedRows', () => {
  it('starts empty when no query data is available yet', () => {
    const { result } = renderHook(() => useSyncedRows<Row>(undefined));

    expect(result.current[0]).toEqual([]);
  });

  it('reflects query data that is already cached and available on the very first render', () => {
    // Regression test: this is the exact bug hit navigating back to an
    // already-visited month/page within the RTK Query cache window — rows
    // silently stayed empty because the "sync on change" guard never saw a
    // change on a mount where the data was already resolved.
    const data: Row[] = [{ id: '1' }, { id: '2' }];

    const { result } = renderHook(() => useSyncedRows(data));

    expect(result.current[0]).toBe(data);
  });

  it('picks up query data that arrives after an initial undefined render', () => {
    const { result, rerender } = renderHook(
      ({ data }: { data: Row[] | undefined }) => useSyncedRows(data),
      { initialProps: { data: undefined as Row[] | undefined } },
    );
    expect(result.current[0]).toEqual([]);

    const data: Row[] = [{ id: '1' }];
    rerender({ data });

    expect(result.current[0]).toBe(data);
  });

  it('updates when the query data reference changes to a new value', () => {
    const first: Row[] = [{ id: '1' }];
    const { result, rerender } = renderHook(
      ({ data }: { data: Row[] }) => useSyncedRows(data),
      { initialProps: { data: first } },
    );
    expect(result.current[0]).toBe(first);

    const second: Row[] = [{ id: '2' }];
    rerender({ data: second });

    expect(result.current[0]).toBe(second);
  });

  it('lets the caller mutate rows locally via the returned setter', () => {
    const data: Row[] = [{ id: '1' }];
    const { result } = renderHook(() => useSyncedRows(data));

    act(() => {
      result.current[1]((rows) => [...rows, { id: '2' }]);
    });

    expect(result.current[0]).toEqual([{ id: '1' }, { id: '2' }]);
  });
});
