export const tableStyles = {
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.15)",
  padding: "10px",
  border: "solid 1px #9b9b9b",
  minHeight: "500px",

  "& .MuiDataGrid-cell": {
    fontSize: "0.875rem",
    borderRight: "0.5px solid #e0e0e0",
    borderLeft: "0.5px solid #e0e0e0",
    // MUI X DataGrid v7+ stopped making cells `display: flex` by default
    // (only opt-in per column via `display: 'flex'`); restore the previous
    // vertically-centered look app-wide here instead of on every column.
    display: "flex",
    alignItems: "center",
  },
  "& .MuiDataGrid-cellContent": {
    textAlign: "left",
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#fafafa",
    color: "#4A4A4A",
    borderBottom: "1px solid #eeb12e",
    borderTop: "1px solid #eeb12e",
  },
  "& .MuiDataGrid-columnHeader": {
    borderRight: "0.5px solid #e0e0e0",
    borderLeft: "0.5px solid #e0e0e0",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: "bold",
  },
  "& .MuiDataGrid-row": {
    backgroundColor: "#ffffff",
    color: "#4A4A4A",
  },
  "& .MuiDataGrid-row:last-child": {
    borderBottom: "0.5px solid #e0e0e0",
  },
  "& .MuiDataGrid-toolbarContainer": {
    backgroundColor: "#fff",
    paddingBottom: "10px",
  },
  "& .MuiButton-text": {
    fontWeight: "bold",
  },
};
