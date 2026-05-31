import { GridRowClassNameParams } from "@mui/x-data-grid";
import { Currency } from "../expenses/helpers";
import type { RecurringIncomeEntries } from "./AssetsPage.types";
import { IncomeData } from "../../services/income/incomeApi.types";

export enum IncomeCategories {
  BANK_ACCOUNTS = "bankAccounts",
  CRYPTO = "crypto",
  INVESTMENTS = "investments",
  CASH = "cash",
}

export const getRecurringIncomeEntries = (): RecurringIncomeEntries[] => {
  return [
    {
      category: IncomeCategories.BANK_ACCOUNTS,
      amount: 0,
      description: "",
      date: "",
      currency: Currency.USD,
    },
    {
      category: IncomeCategories.BANK_ACCOUNTS,
      amount: 300,
      description: "",
      date: "",
      currency: Currency.CAD,
    },
    {
      category: IncomeCategories.CRYPTO,
      amount: 0,
      description: "",
      date: "",
      currency: Currency.USD,
    },
    {
      category: IncomeCategories.INVESTMENTS,
      amount: 0,
      description: "",
      date: "",
      currency: Currency.USD,
    },
    {
      category: IncomeCategories.CASH,
      amount: 0,
      description: "",
      date: "",
      currency: Currency.USD,
    },
  ];
};

export const getRowClassName = (
  params: GridRowClassNameParams<IncomeData>,
  rows: IncomeData[],
) => {
  const currentRowIndex = rows.findIndex((row) => row.id === params.id);

  const currentMonth = new Date(params.row.date).getMonth();

  const previousRow = currentRowIndex > 0 ? rows[currentRowIndex - 1] : null;
  const previousMonth = previousRow
    ? new Date(previousRow.date).getMonth()
    : currentMonth;

  return currentMonth !== previousMonth ? "new-month-row" : "";
};
