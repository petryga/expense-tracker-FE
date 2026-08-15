import { type Dispatch, type SetStateAction, useState } from 'react';

/**
 * Copies query data into locally-mutable row state (inline edits, added
 * rows, optimistic deletes all need somewhere to live between refetches).
 *
 * `rows` must be seeded from `queryData` on the very first render, not just
 * whenever it later changes: if `queryData` is already sitting in the RTK
 * Query cache when this mounts (e.g. navigating back to a page you'd
 * already visited), the "sync on change" guard below never fires, because
 * `synced`'s own lazy initializer captures that same already-resolved
 * value on that first render, so `queryData !== synced` is false from the
 * start and `rows` is left stuck at whatever it's separately initialized to.
 */
export function useSyncedRows<T>(
  queryData: T[] | undefined,
): [T[], Dispatch<SetStateAction<T[]>>] {
  const [rows, setRows] = useState<T[]>(queryData ?? []);

  // Adjusted during render rather than in an effect to avoid the extra
  // commit a sync effect would cause.
  const [synced, setSynced] = useState(queryData);
  if (queryData && queryData !== synced) {
    setSynced(queryData);
    setRows(queryData);
  }

  return [rows, setRows];
}
