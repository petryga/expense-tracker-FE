export const tableStyles = {
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 6px 0 rgba(0, 0, 0, 0.15)',
  padding: '10px',
  border: 'solid 1px #9b9b9b',
  minHeight: '500px',

  '& .MuiDataGrid-cell': {
    fontSize: '0.875rem',
    borderRight: '0.5px solid #e0e0e0',
    borderLeft: '0.5px solid #e0e0e0',
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#fafafa',
    color: '#4A4A4A',
    borderBottom: '1px solid #eeb12e',
    borderTop: '1px solid #eeb12e',
  },
  '& .MuiDataGrid-columnHeader': {
    borderRight: '0.5px solid #e0e0e0',
    borderLeft: '0.5px solid #e0e0e0',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
  },
  '& .MuiDataGrid-row': {
    backgroundColor: '#ffffff',
    color: '#4A4A4A',
  },

  '& .MuiDataGrid-row:last-child': {
    borderBottom: '0.5px solid #e0e0e0',
  },
  '& .MuiDataGrid-toolbarContainer': {
    backgroundColor: '#fff',
    paddingBottom: '10px',
  },
  '& .MuiButton-text': {
    fontWeight: 'bold',
  },
};

export const tabsStyles = {
  '.MuiTab-root.Mui-selected': {
    color: '#eeb12e',
  },
  '.MuiTab-root': {
    color: '#727272',
  },
  '.MuiTabs-indicator': {
    backgroundColor: '#eeb12e',
    height: '2px',
  },
};
