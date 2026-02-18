import { format, parseISO } from "date-fns";
import { Data as ExpenseData } from "../../services/expenses/expensesApi.types";
import { IncomeData } from "../../services/income/incomeApi.types";
import { convertAmount } from "../../utils/currency";
import { Currency } from "../expenses/helpers";
import { IncomeCategories } from "../income/helpers";

type SankeyNode = { name: string; color?: string; fill?: string };
type SankeyLink = {
  source: number;
  target: number;
  value: number;
  color?: string;
};

const ALLOWED_INCOME_CATEGORIES = new Set([
  IncomeCategories.BANK_ACCOUNTS,
  IncomeCategories.CASH,
  IncomeCategories.INVESTMENTS,
]);

export const COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#10b981",
  "#f97316",
  "#ec4899",
  "#22c55e",
  "#14b8a6",
  "#f59e0b",
  "#6366f1",
  "#e11d48",
];
const SAVINGS_COLOR = "#22c55e";

const toUsd = (
  amount: number,
  currency: Currency | "",
  year?: number,
  month?: number,
) => {
  if (!Number.isFinite(amount)) return 0;
  if (currency === Currency.CAD) {
    return convertAmount({
      amount,
      fromCurrency: Currency.CAD,
      toCurrency: Currency.USD,
      year,
      month,
    });
  }
  return amount;
};

export const buildSankeyData = (
  incomeEntries?: IncomeData[],
  expenses?: ExpenseData[],
  selectedMonth?: string,
): {
  nodes: SankeyNode[];
  links: SankeyLink[];
  monthLabel: string;
  incomeAmount: number;
  expenseTotal: number;
  availableMonths: string[];
  activeMonth?: string;
} => {
  if (!incomeEntries || !incomeEntries.length) {
    return {
      nodes: [],
      links: [],
      monthLabel: "",
      incomeAmount: 0,
      expenseTotal: 0,
      availableMonths: [],
    };
  }

  const totalsByMonth = incomeEntries.reduce<Record<string, number>>(
    (acc, entry) => {
      if (
        !entry.date ||
        !ALLOWED_INCOME_CATEGORIES.has(entry.category as IncomeCategories)
      ) {
        return acc;
      }

      const month = entry.date.slice(0, 7);
      const [entryYear, entryMonth] = month
        .split("-")
        .map((part) => parseInt(part, 10));
      const rawAmount =
        typeof entry.amount === "number"
          ? entry.amount
          : parseFloat(String(entry.amount));
      const parsedAmount = toUsd(
        rawAmount,
        entry.currency as Currency,
        entryYear,
        entryMonth,
      );

      acc[month] = (acc[month] ?? 0) + parsedAmount;
      return acc;
    },
    {},
  );

  const months = Object.keys(totalsByMonth).sort();

  const expenseMonths = new Set(
    (expenses ?? [])
      .filter((expense) => expense.amount > 0)
      .map((expense) => expense.datePosted.slice(0, 7)),
  );

  const monthsWithExpenses = months.filter(
    (month, idx) => expenseMonths.has(month) && idx > 0,
  );

  if (monthsWithExpenses.length < 1) {
    return {
      nodes: [],
      links: [],
      monthLabel: "",
      incomeAmount: 0,
      expenseTotal: 0,
      availableMonths: [],
    };
  }

  const desiredIndex = selectedMonth
    ? monthsWithExpenses.indexOf(selectedMonth)
    : monthsWithExpenses.length - 1;
  const activeIndex =
    desiredIndex >= 0 ? desiredIndex : monthsWithExpenses.length - 1;
  const previousIndex = activeIndex - 1;

  if (previousIndex < 0) {
    return {
      nodes: [],
      links: [],
      monthLabel: "",
      incomeAmount: 0,
      expenseTotal: 0,
      availableMonths: monthsWithExpenses,
      activeMonth: monthsWithExpenses[activeIndex],
    };
  }

  const currentMonth = monthsWithExpenses[activeIndex];
  const previousMonth = monthsWithExpenses[previousIndex];
  const incomeAmount = parseFloat(
    (totalsByMonth[currentMonth] - totalsByMonth[previousMonth]).toFixed(2),
  );

  const expensesByCategory = (expenses ?? []).reduce<Record<string, number>>(
    (acc, expense) => {
      if (!expense.datePosted.startsWith(currentMonth) || expense.amount <= 0) {
        return acc;
      }

      const [currentYear, currentMonthNumber] = currentMonth
        .split("-")
        .map((part) => parseInt(part, 10));
      const amountUsd = toUsd(
        expense.amount,
        expense.currency as Currency,
        currentYear,
        currentMonthNumber,
      );
      acc[expense.category] = (acc[expense.category] ?? 0) + amountUsd;
      return acc;
    },
    {},
  );

  const categories = Object.entries(expensesByCategory).sort(
    (a, b) => b[1] - a[1],
  );

  const expenseTotal = categories.reduce((acc, [, value]) => acc + value, 0);
  const netChange = Math.abs(incomeAmount);
  const incomeGross = expenseTotal + netChange;
  const savingsAmount = netChange;
  const totalOutflow = expenseTotal + savingsAmount;

  if (incomeGross <= 0 || totalOutflow <= 0) {
    return {
      nodes: [],
      links: [],
      monthLabel: "",
      incomeAmount: incomeGross,
      expenseTotal,
      availableMonths: monthsWithExpenses,
      activeMonth: currentMonth,
    };
  }

  const scale = totalOutflow > incomeGross ? incomeGross / totalOutflow : 1;

  const nodes: SankeyNode[] = [
    {
      name: `Income • $${incomeGross.toFixed(0)}`,
      color: "#0ea5e9",
      fill: "#0ea5e9",
    },
    ...categories.map(([category, value], idx) => ({
      name: `${category} • $${value.toFixed(0)}`,
      color: COLORS[idx % COLORS.length],
      fill: COLORS[idx % COLORS.length],
    })),
    ...(savingsAmount > 0
      ? [
          {
            name: `Savings • $${savingsAmount.toFixed(0)}`,
            color: SAVINGS_COLOR,
            fill: SAVINGS_COLOR,
          },
        ]
      : []),
  ];

  const links: SankeyLink[] = categories.map(([_, value], index) => ({
    source: 0,
    target: index + 1,
    value: parseFloat((value * scale).toFixed(2)),
    color: nodes[index + 1].color,
  }));

  if (savingsAmount > 0) {
    links.push({
      source: 0,
      target: categories.length + 1,
      value: parseFloat((savingsAmount * scale).toFixed(2)),
      color: SAVINGS_COLOR,
    });
  }

  return {
    nodes,
    links,
    monthLabel: format(parseISO(`${currentMonth}-01`), "MMMM yyyy"),
    incomeAmount: incomeGross,
    expenseTotal,
    availableMonths: monthsWithExpenses,
    activeMonth: currentMonth,
  };
};
