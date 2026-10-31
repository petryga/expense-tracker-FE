export const tableStyles = {
  backgroundColor: 'var(--surface)',
  boxShadow: '0 2px 6px 0 var(--shadow-color)',
  padding: '10px',
  border: 'solid 1px var(--border-strong)',
  minHeight: '500px',
  marginBottom: '24px',

  '& .MuiDataGrid-cell': {
    fontSize: '0.875rem',
    borderRight: '0.5px solid var(--border)',
    borderLeft: '0.5px solid var(--border)',
    // MUI X DataGrid v7+ stopped making cells `display: flex` by default
    // (only opt-in per column via `display: 'flex'`); restore the previous
    // vertically-centered look app-wide here instead of on every column.
    display: 'flex',
    alignItems: 'center',
  },
  // The empty filler cell after the last column picked up the cell borders above
  // and made the grid scroll sideways by 2px.
  '& .MuiDataGrid-cellEmpty': {
    border: 'none',
    padding: 0,
  },
  // Assets date column: only while editing, trim the side padding so the narrow
  // column still fits the MM/DD/YYYY editor. Display keeps the normal padding.
  '& .MuiDataGrid-cell--editing[data-field="date"]': {
    paddingLeft: '4px',
    paddingRight: '4px',
  },
  '& .MuiDataGrid-cellContent': {
    textAlign: 'left',
  },
  '& .MuiDataGrid-columnHeaders': {
    // The last column's resize handle sticks out past the grid and caused a sideways scroll.
    overflow: 'hidden',
    backgroundColor: 'var(--surface-subtle)',
    color: 'var(--text)',
    borderBottom: '1px solid #eeb12e',
    borderTop: '1px solid #eeb12e',
  },
  '& .MuiDataGrid-columnHeader': {
    borderRight: '0.5px solid var(--border)',
    borderLeft: '0.5px solid var(--border)',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
  },
  '& .MuiDataGrid-row': {
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
  },
  '& .MuiDataGrid-row:last-child': {
    borderBottom: '0.5px solid var(--border)',
  },
  '& .MuiDataGrid-toolbarContainer': {
    backgroundColor: 'var(--surface)',
    paddingBottom: '10px',
  },
  '& .MuiButton-text': {
    fontWeight: 'bold',
  },
};
