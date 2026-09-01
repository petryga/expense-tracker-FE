import { format, parseISO } from 'date-fns';
import { Data as ExpenseData } from '../../services/expenses/expensesApi.types';
import { IncomeData } from '../../services/income/incomeApi.types';
import { convertAmount } from '../../utils/currency';
import { Currency } from '../expenses/helpers';
import { IncomeCategories } from '../income/helpers';

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
  '#0ea5e9',
  '#8b5cf6',
  '#10b981',
  '#f97316',
  '#ec4899',
  '#22c55e',
  '#14b8a6',
  '#f59e0b',
  '#6366f1',
  '#e11d48',
];
const SAVINGS_COLOR = '#22c55e';

const toUsd = (amount: number, currency: Currency | '', year?: number, month?: number) => {
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
  const empty = {
    nodes: [] as SankeyNode[],
    links: [] as SankeyLink[],
    monthLabel: '',
    incomeAmount: 0,
    expenseTotal: 0,
    availableMonths: [] as string[],
  };

  if (!incomeEntries?.length) return empty;

  const totalsByMonth = incomeEntries.reduce<Record<string, number>>((acc, entry) => {
    if (!entry.date || !ALLOWED_INCOME_CATEGORIES.has(entry.category as IncomeCategories)) {
      return acc;
    }

    const month = entry.date.slice(0, 7);
    const [year, mon] = month.split('-').map(Number);
    const raw = typeof entry.amount === 'number' ? entry.amount : parseFloat(String(entry.amount));
    acc[month] = (acc[month] ?? 0) + toUsd(raw, entry.currency as Currency, year, mon);
    return acc;
  }, {});

  const months = Object.keys(totalsByMonth).sort();
  const expenseMonths = new Set(
    (expenses ?? []).filter((e) => e.amount > 0).map((e) => e.datePosted.slice(0, 7)),
  );
  const monthsWithExpenses = months.filter((month, idx) => expenseMonths.has(month) && idx > 0);

  if (monthsWithExpenses.length < 1) return empty;

  const desiredIndex = selectedMonth
    ? monthsWithExpenses.indexOf(selectedMonth)
    : monthsWithExpenses.length - 1;
  const activeIndex = desiredIndex >= 0 ? desiredIndex : monthsWithExpenses.length - 1;
  const previousIndex = activeIndex - 1;

  if (previousIndex < 0) {
    return {
      ...empty,
      availableMonths: monthsWithExpenses,
      activeMonth: monthsWithExpenses[activeIndex],
    };
  }

  const currentMonth = monthsWithExpenses[activeIndex];
  const previousMonth = monthsWithExpenses[previousIndex];
  const savings = Math.abs(
    parseFloat((totalsByMonth[currentMonth] - totalsByMonth[previousMonth]).toFixed(2)),
  );

  const [currentYear, currentMonthNumber] = currentMonth.split('-').map(Number);
  const expensesByCategory = (expenses ?? []).reduce<Record<string, number>>((acc, expense) => {
    if (!expense.datePosted.startsWith(currentMonth) || expense.amount <= 0) {
      return acc;
    }
    acc[expense.category] =
      (acc[expense.category] ?? 0) +
      toUsd(expense.amount, expense.currency as Currency, currentYear, currentMonthNumber);
    return acc;
  }, {});

  const categories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
  const expenseTotal = categories.reduce((acc, [, v]) => acc + v, 0);
  const incomeGross = expenseTotal + savings;

  if (incomeGross <= 0) {
    return {
      ...empty,
      expenseTotal,
      availableMonths: monthsWithExpenses,
      activeMonth: currentMonth,
    };
  }

  const nodes: SankeyNode[] = [
    { name: `Income • $${incomeGross.toFixed(0)}`, color: '#0ea5e9', fill: '#0ea5e9' },
    ...categories.map(([category, value], idx) => ({
      name: `${category} • $${value.toFixed(0)}`,
      color: COLORS[idx % COLORS.length],
      fill: COLORS[idx % COLORS.length],
    })),
    ...(savings > 0
      ? [{ name: `Savings • $${savings.toFixed(0)}`, color: SAVINGS_COLOR, fill: SAVINGS_COLOR }]
      : []),
  ];

  const links: SankeyLink[] = [
    ...categories.map(([_, value], index) => ({
      source: 0,
      target: index + 1,
      value: parseFloat(value.toFixed(2)),
      color: nodes[index + 1].color,
    })),
    ...(savings > 0
      ? [
          {
            source: 0,
            target: categories.length + 1,
            value: parseFloat(savings.toFixed(2)),
            color: SAVINGS_COLOR,
          },
        ]
      : []),
  ];

  return {
    nodes,
    links,
    monthLabel: format(parseISO(`${currentMonth}-01`), 'MMMM yyyy'),
    incomeAmount: incomeGross,
    expenseTotal,
    availableMonths: monthsWithExpenses,
    activeMonth: currentMonth,
  };
};
