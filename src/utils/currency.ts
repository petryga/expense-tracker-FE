import { Currency } from '../features/expenses/helpers';

export interface FxRateConfig {
  defaultCadToUsd: number;
  cadToUsdByYear?: Partial<Record<number, number>>;
  cadToUsdByYearMonth?: Record<string, number>;
}

export const DEFAULT_FX_RATE_CONFIG: FxRateConfig = {
  defaultCadToUsd: 0.74,
  cadToUsdByYear: {},
  cadToUsdByYearMonth: {},
};

const toYearMonthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`;

export const getCadToUsdRate = ({
  year,
  month,
  rates = DEFAULT_FX_RATE_CONFIG,
}: {
  year?: number;
  month?: number;
  rates?: FxRateConfig;
} = {}) => {
  if (
    year &&
    month &&
    rates.cadToUsdByYearMonth &&
    rates.cadToUsdByYearMonth[toYearMonthKey(year, month)]
  ) {
    return rates.cadToUsdByYearMonth[toYearMonthKey(year, month)] as number;
  }

  if (year && rates.cadToUsdByYear && rates.cadToUsdByYear[year]) {
    return rates.cadToUsdByYear[year] as number;
  }

  return rates.defaultCadToUsd;
};

export const convertAmount = ({
  amount,
  fromCurrency,
  toCurrency,
  year,
  month,
  rates,
}: {
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  year?: number;
  month?: number;
  rates?: FxRateConfig;
}) => {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  if (fromCurrency === toCurrency) {
    return amount;
  }

  const cadToUsdRate = getCadToUsdRate({ year, month, rates });

  if (fromCurrency === Currency.CAD && toCurrency === Currency.USD) {
    return amount * cadToUsdRate;
  }

  if (fromCurrency === Currency.USD && toCurrency === Currency.CAD) {
    if (cadToUsdRate === 0) {
      return 0;
    }
    return amount / cadToUsdRate;
  }

  return amount;
};
