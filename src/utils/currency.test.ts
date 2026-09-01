import { describe, expect, it } from 'vitest';
import { convertAmount, getCadToUsdRate, type FxRateConfig } from './currency';
import { Currency } from '../features/expenses/helpers';

describe('getCadToUsdRate', () => {
  it('falls back to the default rate with no config', () => {
    expect(getCadToUsdRate()).toBe(0.74);
  });

  it('uses the default rate when no year/month override applies', () => {
    const rates: FxRateConfig = { defaultCadToUsd: 0.8 };
    expect(getCadToUsdRate({ year: 2026, month: 7, rates })).toBe(0.8);
  });

  it('prefers a per-year override over the default', () => {
    const rates: FxRateConfig = { defaultCadToUsd: 0.8, cadToUsdByYear: { 2026: 0.75 } };
    expect(getCadToUsdRate({ year: 2026, month: 7, rates })).toBe(0.75);
  });

  it('prefers a per-year-month override over the per-year and default rates', () => {
    const rates: FxRateConfig = {
      defaultCadToUsd: 0.8,
      cadToUsdByYear: { 2026: 0.75 },
      cadToUsdByYearMonth: { '2026-07': 0.7 },
    };
    expect(getCadToUsdRate({ year: 2026, month: 7, rates })).toBe(0.7);
  });

  it('does not use a per-year-month override for a different month', () => {
    const rates: FxRateConfig = {
      defaultCadToUsd: 0.8,
      cadToUsdByYearMonth: { '2026-07': 0.7 },
    };
    expect(getCadToUsdRate({ year: 2026, month: 8, rates })).toBe(0.8);
  });
});

describe('convertAmount', () => {
  it('returns the amount unchanged when currencies match', () => {
    expect(
      convertAmount({ amount: 100, fromCurrency: Currency.CAD, toCurrency: Currency.CAD }),
    ).toBe(100);
  });

  it('converts CAD to USD using the resolved rate', () => {
    const rates: FxRateConfig = { defaultCadToUsd: 0.5 };
    expect(
      convertAmount({ amount: 100, fromCurrency: Currency.CAD, toCurrency: Currency.USD, rates }),
    ).toBe(50);
  });

  it('converts USD to CAD using the resolved rate', () => {
    const rates: FxRateConfig = { defaultCadToUsd: 0.5 };
    expect(
      convertAmount({ amount: 50, fromCurrency: Currency.USD, toCurrency: Currency.CAD, rates }),
    ).toBe(100);
  });

  it('returns 0 instead of dividing by zero when the rate is 0', () => {
    const rates: FxRateConfig = { defaultCadToUsd: 0 };
    expect(
      convertAmount({ amount: 50, fromCurrency: Currency.USD, toCurrency: Currency.CAD, rates }),
    ).toBe(0);
  });

  it('returns 0 for a non-finite amount', () => {
    expect(
      convertAmount({ amount: NaN, fromCurrency: Currency.CAD, toCurrency: Currency.USD }),
    ).toBe(0);
    expect(
      convertAmount({ amount: Infinity, fromCurrency: Currency.CAD, toCurrency: Currency.USD }),
    ).toBe(0);
  });
});
