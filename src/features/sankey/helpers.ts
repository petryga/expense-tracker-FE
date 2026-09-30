import { format, parseISO } from 'date-fns';
import { Data as ExpenseData } from '../../services/expenses/expensesApi.types';
import { IncomeData } from '../../services/income/incomeApi.types';
import { convertAmount } from '../../utils/currency';
import { formatNumberWithCommas } from '../../utils';
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

// A signed dollar amount for the header totals / node labels, e.g.
// 150.4 -> "$150" and -75 -> "-$75".
export const formatSignedAmount = (value: number) => {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${formatNumberWithCommas(Math.abs(value).toFixed(0))}`;
};

const isSavingsNode = (name: string) => name.startsWith('Savings');

// Forces the Savings node (whatever its value) to always sort to the bottom
// of its column in the chart, rather than nivo's default "auto" placement,
// which can reorder it based on value/connections.
export const sortSavingsLast = (a: { name: string }, b: { name: string }) => {
  const aIsSavings = isSavingsNode(a.name);
  const bIsSavings = isSavingsNode(b.name);
  if (aIsSavings === bIsSavings) return 0;
  return aIsSavings ? 1 : -1;
};

// Splits a trailing "(...)" breakdown off a node label, e.g. the Savings
// node's "Savings • $200 (Cash $150 / Investments $50)" -- used to render
// that breakdown on its own line, since SVG <text> doesn't wrap.
export const splitTrailingParenthetical = (label: string): [string, string | null] => {
  const match = /^(.*?)(\s*\([^)]*\))\s*$/.exec(label);
  return match ? [match[1].trim(), match[2].trim()] : [label, null];
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
  cashSavings: number;
  investmentGrowth: number;
} => {
  const empty = {
    nodes: [] as SankeyNode[],
    links: [] as SankeyLink[],
    monthLabel: '',
    incomeAmount: 0,
    expenseTotal: 0,
    availableMonths: [] as string[],
    cashSavings: 0,
    investmentGrowth: 0,
  };

  if (!incomeEntries?.length) return empty;

  // Bank/cash and investment balances are tracked separately (not just
  // combined into totalsByMonth) so the month-over-month "savings" swing can
  // be attributed to money you actually set aside (cashSavings) vs. your
  // investments simply appreciating or being contributed to
  // (investmentGrowth) -- see buildSankeyData's Savings node label below.
  const totalsByMonth: Record<string, number> = {};
  const cashTotalsByMonth: Record<string, number> = {};
  const investTotalsByMonth: Record<string, number> = {};

  incomeEntries.forEach((entry) => {
    if (!entry.date || !ALLOWED_INCOME_CATEGORIES.has(entry.category as IncomeCategories)) {
      return;
    }

    const month = entry.date.slice(0, 7);
    const [year, mon] = month.split('-').map(Number);
    const raw = typeof entry.amount === 'number' ? entry.amount : parseFloat(String(entry.amount));
    const usd = toUsd(raw, entry.currency as Currency, year, mon);

    totalsByMonth[month] = (totalsByMonth[month] ?? 0) + usd;
    if (entry.category === IncomeCategories.INVESTMENTS) {
      investTotalsByMonth[month] = (investTotalsByMonth[month] ?? 0) + usd;
    } else {
      cashTotalsByMonth[month] = (cashTotalsByMonth[month] ?? 0) + usd;
    }
  });

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

  // These are a breakdown of the same swing `savings` captures, not a
  // separate figure -- cashSavings + investmentGrowth always equals the
  // (signed) change that `savings` takes the absolute value of. Splitting
  // them out is display-only, distinguishing money you actually set aside
  // in bank/cash accounts from your investments moving on their own.
  const cashSavings = parseFloat(
    ((cashTotalsByMonth[currentMonth] ?? 0) - (cashTotalsByMonth[previousMonth] ?? 0)).toFixed(2),
  );
  const investmentGrowth = parseFloat(
    ((investTotalsByMonth[currentMonth] ?? 0) - (investTotalsByMonth[previousMonth] ?? 0)).toFixed(
      2,
    ),
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
      cashSavings,
      investmentGrowth,
    };
  }

  const nodes: SankeyNode[] = [
    {
      name: `Income • $${formatNumberWithCommas(incomeGross.toFixed(0))}`,
      color: '#0ea5e9',
      fill: '#0ea5e9',
    },
    ...categories.map(([category, value], idx) => ({
      name: `${category} • $${formatNumberWithCommas(value.toFixed(0))}`,
      color: COLORS[idx % COLORS.length],
      fill: COLORS[idx % COLORS.length],
    })),
    ...(savings > 0
      ? [
          {
            name: `Savings • $${formatNumberWithCommas(savings.toFixed(0))} (Cash ${formatSignedAmount(cashSavings)} / Investments ${formatSignedAmount(investmentGrowth)})`,
            color: SAVINGS_COLOR,
            fill: SAVINGS_COLOR,
          },
        ]
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
    cashSavings,
    investmentGrowth,
  };
};
