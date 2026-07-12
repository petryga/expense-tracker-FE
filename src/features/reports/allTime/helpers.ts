import { Currency } from '../../expenses/helpers';
import { convertAmount, type FxRateConfig } from '../../../utils/currency';
import { MonthlyDataTypes, type MonthlyData } from '../../../services/monthlyData/monthlyData.types';

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

export type YearlyComparisonMode = 'ytd' | 'full-year';

export interface YearlyComparisonRow {
  year: number;
  amountCad: number;
  amountUsd: number;
  convertedTotal: number;
  monthsCount: number;
  cutoffMonth: number | null;
  annualized: number;
  isIncomplete: boolean;
}

export interface YearlyComparisonResult {
  rows: YearlyComparisonRow[];
  ytdCutoffOptionsByYear: Record<number, number[]>;
  defaultYtdCutoffByYear: Record<number, number>;
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
  expenses?: MonthlyData[]
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
  const maxValue = data.reduce(
    (max, item) => Math.max(max, item.amountCad, item.amountUsd),
    0
  );
  return maxValue > 0 ? Math.ceil(maxValue * 1.1) : 100;
};

export const buildYearlyComparisonData = ({
  data,
  mode,
  baseCurrency,
  ytdCutoffByYear,
  rates,
}: {
  data?: MonthlyData[];
  mode: YearlyComparisonMode;
  baseCurrency: Currency;
  ytdCutoffByYear?: Partial<Record<number, number | null>>;
  rates?: FxRateConfig;
}): YearlyComparisonResult => {
  const monthlyExpenses = aggregateByMonth(MonthlyDataTypes.Expense, data);

  if (!monthlyExpenses.length) {
    return {
      rows: [],
      ytdCutoffOptionsByYear: {},
      defaultYtdCutoffByYear: {},
    };
  }

  const groupedByYear = monthlyExpenses.reduce<Record<number, MonthlyAggregate[]>>((acc, entry) => {
    if (!acc[entry.year]) {
      acc[entry.year] = [];
    }
    acc[entry.year].push(entry);
    return acc;
  }, {});

  const ytdCutoffOptionsByYear: Record<number, number[]> = {};
  const defaultYtdCutoffByYear: Record<number, number> = {};
  const resolvedYtdCutoffByYear: Record<number, number | null> = {};

  Object.entries(groupedByYear).forEach(([yearKey, entries]) => {
    const year = parseInt(yearKey, 10);
    const uniqueMonths = Array.from(new Set(entries.map((entry) => entry.month))).sort((a, b) => a - b);
    const maxMonth = uniqueMonths[uniqueMonths.length - 1];
    const hasExplicitSelection = Object.prototype.hasOwnProperty.call(ytdCutoffByYear ?? {}, year);
    const requestedMonth = ytdCutoffByYear?.[year];
    let resolvedMonth: number | null = maxMonth;

    if (hasExplicitSelection && requestedMonth === null) {
      resolvedMonth = null;
    } else if (typeof requestedMonth === 'number' && uniqueMonths.includes(requestedMonth)) {
      resolvedMonth = requestedMonth;
    }

    ytdCutoffOptionsByYear[year] = uniqueMonths;
    defaultYtdCutoffByYear[year] = maxMonth;
    resolvedYtdCutoffByYear[year] = resolvedMonth;
  });

  const rows = Object.entries(groupedByYear)
    .map(([yearKey, entries]) => {
      const year = parseInt(yearKey, 10);
      const rowCutoffMonth = mode === 'ytd' ? resolvedYtdCutoffByYear[year] ?? null : null;
      if (mode === 'ytd' && rowCutoffMonth === null) {
        return null;
      }

      const selectedEntries =
        mode === 'ytd' && rowCutoffMonth
          ? entries.filter((entry) => entry.month <= rowCutoffMonth)
          : entries;

      const monthsCount = selectedEntries.length;
      if (!monthsCount) {
        return null;
      }

      const amountCad = selectedEntries.reduce((acc, entry) => acc + entry.amountCad, 0);
      const amountUsd = selectedEntries.reduce((acc, entry) => acc + entry.amountUsd, 0);
      const convertedTotal = selectedEntries.reduce((acc, entry) => {
        const cadInBase = convertAmount({
          amount: entry.amountCad,
          fromCurrency: Currency.CAD,
          toCurrency: baseCurrency,
          year: entry.year,
          month: entry.month,
          rates,
        });
        const usdInBase = convertAmount({
          amount: entry.amountUsd,
          fromCurrency: Currency.USD,
          toCurrency: baseCurrency,
          year: entry.year,
          month: entry.month,
          rates,
        });
        return acc + cadInBase + usdInBase;
      }, 0);

      const annualized = monthsCount ? (convertedTotal / monthsCount) * 12 : 0;
      return {
        year,
        amountCad: parseFloat(amountCad.toFixed(2)),
        amountUsd: parseFloat(amountUsd.toFixed(2)),
        convertedTotal: parseFloat(convertedTotal.toFixed(2)),
        cutoffMonth: rowCutoffMonth,
        annualized: parseFloat(annualized.toFixed(2)),
        monthsCount,
        isIncomplete: mode === 'ytd' && rowCutoffMonth ? monthsCount < rowCutoffMonth : monthsCount < 12,
      };
    })
    .filter((row): row is YearlyComparisonRow => row !== null)
    .sort((a, b) => a.year - b.year);

  return {
    rows,
    ytdCutoffOptionsByYear,
    defaultYtdCutoffByYear,
  };
};
