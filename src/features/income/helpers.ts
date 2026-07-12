import { GridRowClassNameParams } from "@mui/x-data-grid";
import { IncomeData } from "../../services/income/incomeApi.types";

export enum IncomeCategories {
  BANK_ACCOUNTS = "bankAccounts",
  CRYPTO = "crypto",
  INVESTMENTS = "investments",
  CASH = "cash",
}

export const getRowClassName = (
  params: GridRowClassNameParams<IncomeData>,
  rows: IncomeData[],
) => {
  const currentRowIndex = rows.findIndex((row) => row.id === params.id);

  // getUTCMonth (not getMonth) since `date` is a plain "yyyy-MM-dd" string,
  // which parses as UTC midnight — reading the local month can roll a
  // first-of-the-month date back into the previous month near timezone
  // boundaries.
  const currentMonth = new Date(params.row.date).getUTCMonth();

  const previousRow = currentRowIndex > 0 ? rows[currentRowIndex - 1] : null;
  const previousMonth = previousRow
    ? new Date(previousRow.date).getUTCMonth()
    : currentMonth;

  return currentMonth !== previousMonth ? "new-month-row" : "";
};
