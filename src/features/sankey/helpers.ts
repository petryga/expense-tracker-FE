import { format, parseISO } from 'date-fns';
import type { FlowReport } from '../../services/monthlyData/monthlyData.types';
import { formatNumberWithCommas } from '../../utils';

type SankeyNode = { name: string; color?: string; fill?: string };
type SankeyLink = {
  source: number;
  target: number;
  value: number;
  color?: string;
};

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

// The BE decides which months are comparable and does the sums and the CAD->USD
// conversion; this only turns its numbers into chart nodes and links.
export const buildSankeyData = (
  report?: FlowReport,
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
  const availableMonths = report?.availableMonths ?? [];
  const activeMonth = report?.activeMonth ?? undefined;
  const base = {
    nodes: [] as SankeyNode[],
    links: [] as SankeyLink[],
    monthLabel: '',
    incomeAmount: 0,
    expenseTotal: report?.expenseTotal ?? 0,
    availableMonths,
    activeMonth,
    cashSavings: report?.cashSavings ?? 0,
    investmentGrowth: report?.investmentGrowth ?? 0,
  };

  if (!report || !activeMonth || report.incomeAmount <= 0 || !report.categories.length) {
    return base;
  }

  const { categories, savings, cashSavings, investmentGrowth } = report;

  const nodes: SankeyNode[] = [
    {
      name: `Income • $${formatNumberWithCommas(report.incomeAmount.toFixed(0))}`,
      color: '#0ea5e9',
      fill: '#0ea5e9',
    },
    ...categories.map(({ category, value }, idx) => ({
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
    ...categories.map(({ value }, index) => ({
      source: 0,
      target: index + 1,
      value,
      color: nodes[index + 1].color,
    })),
    ...(savings > 0
      ? [{ source: 0, target: categories.length + 1, value: savings, color: SAVINGS_COLOR }]
      : []),
  ];

  return {
    ...base,
    nodes,
    links,
    monthLabel: format(parseISO(`${activeMonth}-01`), 'MMMM yyyy'),
    incomeAmount: report.incomeAmount,
  };
};
