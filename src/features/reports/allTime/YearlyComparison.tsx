import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  type TooltipValueType,
  XAxis,
  YAxis,
} from "recharts";
import { Currency } from "../../expenses/helpers";
import type { MonthlyData } from "../../../services/monthlyData/monthlyData.types";
import {
  buildYearlyComparisonData,
  type YearlyComparisonMode,
} from "./helpers";
import styles from "./YearlyComparison.module.css";

const formatMoney = (amount: number, currency: Currency) => {
  const symbol = currency === Currency.CAD ? "C$" : "$";
  return `${symbol}${amount.toFixed(2)}`;
};

export const YearlyComparison = ({ data }: { data?: MonthlyData[] }) => {
  const [mode, setMode] = useState<YearlyComparisonMode>("full-year");
  const [baseCurrency, setBaseCurrency] = useState<Currency>(Currency.USD);
  const [ytdCutoffByYear, setYtdCutoffByYear] = useState<
    Record<number, number | null>
  >({});

  const { rows, ytdCutoffOptionsByYear, defaultYtdCutoffByYear } = useMemo(
    () =>
      buildYearlyComparisonData({ data, mode, baseCurrency, ytdCutoffByYear }),
    [data, mode, baseCurrency, ytdCutoffByYear],
  );

  // Reconciles each year's YTD cutoff against the months actually available,
  // keeping an explicit user choice where it is still valid. Done during render
  // rather than in an effect; the hasChanges guard makes it a fixed point, so it
  // settles in one extra pass instead of committing an unreconciled state first.
  const reconciledYtdCutoff = (() => {
    const next: Record<number, number | null> = {};
    let hasChanges = false;

    Object.keys(defaultYtdCutoffByYear).forEach((yearKey) => {
      const year = Number(yearKey);
      const availableMonths = ytdCutoffOptionsByYear[year] ?? [];
      const fallbackCutoff = defaultYtdCutoffByYear[year];
      const previousCutoff = ytdCutoffByYear[year];
      let resolvedCutoff: number | null = fallbackCutoff;

      if (previousCutoff === null) {
        resolvedCutoff = null;
      } else if (previousCutoff && availableMonths.includes(previousCutoff)) {
        resolvedCutoff = previousCutoff;
      }

      next[year] = resolvedCutoff;
      if (ytdCutoffByYear[year] !== resolvedCutoff) {
        hasChanges = true;
      }
    });

    if (Object.keys(ytdCutoffByYear).length !== Object.keys(next).length) {
      hasChanges = true;
    }

    return hasChanges ? next : null;
  })();

  if (reconciledYtdCutoff) {
    setYtdCutoffByYear(reconciledYtdCutoff);
  }

  return (
    <>
      <div className={styles.controls}>
        <label>
          Comparison
          <select
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as YearlyComparisonMode)
            }
          >
            <option value="ytd">YTD vs YTD</option>
            <option value="full-year">Full Year</option>
          </select>
        </label>

        <label>
          Base Currency
          <select
            value={baseCurrency}
            onChange={(event) =>
              setBaseCurrency(event.target.value as Currency)
            }
          >
            <option value={Currency.USD}>USD</option>
            <option value={Currency.CAD}>CAD</option>
          </select>
        </label>
      </div>
      {mode === "ytd" && Object.keys(ytdCutoffOptionsByYear).length > 0 ? (
        <div className={styles.cutoffSection}>
          <p className={styles.cutoffLabel}>YTD cutoff month by year</p>
          <div className={styles.cutoffGrid}>
            {Object.keys(ytdCutoffOptionsByYear)
              .map((year) => Number(year))
              .sort((a, b) => a - b)
              .map((year) => {
                const options = ytdCutoffOptionsByYear[year];
                const hasSelection = Object.prototype.hasOwnProperty.call(
                  ytdCutoffByYear,
                  year,
                );
                const selectedCutoff = hasSelection
                  ? ytdCutoffByYear[year]
                  : defaultYtdCutoffByYear[year];
                return (
                  <label key={year} className={styles.cutoffItem}>
                    {year}
                    <select
                      value={
                        selectedCutoff === null ? "" : String(selectedCutoff)
                      }
                      onChange={(event) =>
                        setYtdCutoffByYear((previous) => ({
                          ...previous,
                          [year]:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        }))
                      }
                    >
                      <option value="">Not selected</option>
                      {options.map((month) => (
                        <option key={month} value={month}>
                          {format(new Date(2000, month - 1, 1), "MMMM")}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}
          </div>
        </div>
      ) : null}

      {!rows.length ? (
        <div className={styles.emptyState}>
          No yearly expense data matches this comparison yet.
        </div>
      ) : (
        <>
          <ResponsiveContainer width={1000} height={390}>
            <BarChart data={rows} margin={{ top: 20, bottom: 20 }}>
              <defs>
                <pattern
                  id="convertedTotalPattern"
                  patternUnits="userSpaceOnUse"
                  width={8}
                  height={8}
                  patternTransform="rotate(45)"
                >
                  <rect width="8" height="8" fill="#eeb12e" />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="8"
                    stroke="#727272"
                    strokeWidth="3"
                  />
                </pattern>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                formatter={(value: TooltipValueType | undefined, name) => {
                  const normalizedName = String(name);
                  const numericValue = Array.isArray(value)
                    ? Number(value[0])
                    : Number(value ?? 0);
                  if (normalizedName === "Converted Total") {
                    return formatMoney(numericValue, baseCurrency);
                  }
                  if (normalizedName === "CAD") {
                    return formatMoney(numericValue, Currency.CAD);
                  }
                  return formatMoney(numericValue, Currency.USD);
                }}
              />
              <Legend />
              <Bar dataKey="amountCad" name="CAD" fill="#8dd1e1" />
              <Bar dataKey="amountUsd" name="USD" fill="#ff8042" />
              <Bar
                dataKey="convertedTotal"
                name="Converted Total"
                fill="url(#convertedTotalPattern)"
                stroke="#727272"
                strokeWidth={1.5}
              />
            </BarChart>
          </ResponsiveContainer>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Year</th>
                <th>CAD</th>
                <th>USD</th>
                <th>Converted Total ({baseCurrency})</th>
                <th>Months Included</th>
                <th>Annualized ({baseCurrency})</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  <td>{formatMoney(row.amountCad, Currency.CAD)}</td>
                  <td>{formatMoney(row.amountUsd, Currency.USD)}</td>
                  <td>{formatMoney(row.convertedTotal, baseCurrency)}</td>
                  <td>
                    {mode === "ytd" && row.cutoffMonth
                      ? `${row.monthsCount}/${row.cutoffMonth}`
                      : row.monthsCount}
                    {row.isIncomplete ? (
                      <span className={styles.badge}>Partial</span>
                    ) : null}
                  </td>
                  <td>{formatMoney(row.annualized, baseCurrency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
};
