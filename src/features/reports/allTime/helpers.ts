import {
  MonthlyDataTypes,
  type MonthlyData,
} from '../../../services/monthlyData/monthlyData.types';
import { INCOME_CATEGORY_LABELS, IncomeCategories } from '../../income/helpers';
import type { RecurringIncomeData } from '../../../services/recurringIncome/recurringIncomeApi.types';

interface ParsedYearMonth {
  year: number;
  month: number;
}

interface MonthlyAggregate {
  year: number;
  month: number;
  amountCad: number;
  amountUsd: number;
}

export interface MonthlyExpense {
  yearMonth: string;
  amountCad: number;
  amountUsd: number;
}

const formatYearMonth = ({ year, month }: ParsedYearMonth) =>
  `${year}-${String(month).padStart(2, '0')}`;

const parseYearMonth = (yearMonth: string): ParsedYearMonth | null => {
  const parsed = /^(\d{4})-(\d{1,2})$/.exec(yearMonth.trim());

  if (!parsed) {
    return null;
  }

  const year = parseInt(parsed[1], 10);
  const month = parseInt(parsed[2], 10);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }

  return { year, month };
};

const parseAmount = (amount: string) => {
  const parsed = parseFloat(amount);
  return Number.isFinite(parsed) ? parsed : 0;
};

const aggregateByMonth = (type: MonthlyDataTypes, data?: MonthlyData[]): MonthlyAggregate[] => {
  if (!data?.length) {
    return [];
  }

  const monthlyMap = data.reduce<Record<string, MonthlyAggregate>>((acc, entry) => {
    if (entry.type !== type) {
      return acc;
    }

    const parsedDate = parseYearMonth(entry.yearMonth);
    if (!parsedDate) {
      return acc;
    }

    const key = formatYearMonth(parsedDate);
    if (!acc[key]) {
      acc[key] = {
        year: parsedDate.year,
        month: parsedDate.month,
        amountCad: 0,
        amountUsd: 0,
      };
    }

    acc[key].amountCad += parseAmount(entry.amountCad);
    acc[key].amountUsd += parseAmount(entry.amountUsd);
    return acc;
  }, {});

  return Object.values(monthlyMap).sort((a, b) => {
    if (a.year === b.year) {
      return a.month - b.month;
    }
    return a.year - b.year;
  });
};

export const groupMonthlyData = (
  type: MonthlyDataTypes,
  expenses?: MonthlyData[],
): MonthlyExpense[] => {
  const monthlyData = aggregateByMonth(type, expenses);

  return monthlyData
    .filter((entry) => entry.amountCad > 0 || entry.amountUsd > 0)
    .map((entry) => ({
      yearMonth: formatYearMonth({ year: entry.year, month: entry.month }),
      amountCad: parseFloat(entry.amountCad.toFixed(2)),
      amountUsd: parseFloat(entry.amountUsd.toFixed(2)),
    }));
};

export const getYAxisMax = (data: MonthlyExpense[]): number => {
  const maxValue = data.reduce((max, item) => Math.max(max, item.amountCad, item.amountUsd), 0);
  if (maxValue <= 0) return 100;
  return Math.ceil((maxValue * 1.1) / 100) * 100;
};

export const ALL_WEALTH = '__all__';

export interface RecurringWealthOption {
  key: string;
  label: string;
  category: string;
  currency: string;
}

// The Monthly Wealth dropdown lists the (category, currency) pairs you track
// through recurring income entries ("Bank Accounts - USD"). The BE does the
// per-category summing: the selected pair is sent as a filter on
// GET /monthlyData.
export const getRecurringWealthOptions = (
  recurring?: RecurringIncomeData[],
): RecurringWealthOption[] => {
  const seen = new Map<string, RecurringWealthOption>();
  (recurring ?? []).forEach(({ category, currency }) => {
    const key = JSON.stringify([category ?? '', currency ?? '']);
    if (seen.has(key)) return;
    const categoryLabel = INCOME_CATEGORY_LABELS[category as IncomeCategories] ?? category;
    seen.set(key, {
      key,
      label: currency ? `${categoryLabel} - ${currency}` : categoryLabel,
      category,
      currency,
    });
  });
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
};
