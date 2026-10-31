import { FC, useCallback, useMemo, useState } from 'react';
import { useGetReportMonthsQuery } from '../../../services/monthlyData/monthlyDataApi';
import { format, parseISO } from 'date-fns';
import { Button } from '@mui/material';
import { withSidebar } from '../../../components/sidebar/withSideBar';
import { VisualizedData } from './VisualizedData';
import classnames from 'classnames';
import styles from './MonthlyReportsPage.module.css';

export const MonthlyReportsPage: FC = () => {
  const { data: reportMonths } = useGetReportMonthsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  // The BE lists the months that have expenses. The current month is always
  // kept reachable, even when empty, so there is a way back to it.
  const dataByYear = useMemo(() => {
    const months = new Set(reportMonths ?? []);
    months.add(format(new Date(), 'yyyy-MM'));

    const byYear: Record<string, Record<string, true>> = {};
    for (const yearMonth of months) {
      const [year, month] = yearMonth.split('-');
      byYear[year] = { ...byYear[year], [month]: true };
    }
    return byYear;
  }, [reportMonths]);
  const hasMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    return Boolean(dataByYear[year]?.[month]);
  };
  const sortedYears = useMemo(
    () => Object.keys(dataByYear).sort((a, b) => Number.parseInt(b) - Number.parseInt(a)),
    [dataByYear],
  );

  const getDefaultYearMonth = useCallback(
    (year: string): string | null => {
      if (!dataByYear[year]) {
        return null;
      }

      const monthsForYear = Object.keys(dataByYear[year]).sort(
        (a, b) => Number.parseInt(b) - Number.parseInt(a),
      );

      if (!monthsForYear.length) {
        return null;
      }

      const currentYearMonth = format(new Date(), 'yyyy-MM');
      const [currentYear, currentMonth] = currentYearMonth.split('-');
      const preferredMonth =
        year === currentYear && monthsForYear.includes(currentMonth)
          ? currentMonth
          : monthsForYear[0];

      return `${year}-${preferredMonth}`;
    },
    [dataByYear],
  );

  // Both selections are reconciled against the data during render rather than
  // in effects. Each computes the value it wants and only writes when it
  // differs from current state, so they converge in one extra render pass
  // instead of committing an intermediate, briefly-wrong selection.
  const desiredYear = (() => {
    if (!sortedYears.length) return null;
    if (selectedYear && sortedYears.includes(selectedYear)) return selectedYear;
    const currentYear = format(new Date(), 'yyyy');
    return sortedYears.includes(currentYear) ? currentYear : sortedYears[0];
  })();
  if (desiredYear !== selectedYear) {
    setSelectedYear(desiredYear);
  }

  if (selectedYear && dataByYear[selectedYear]) {
    const defaultSelection = getDefaultYearMonth(selectedYear);
    const desiredMonth = (() => {
      if (!defaultSelection) return null;
      if (!selectedMonth) return defaultSelection;
      const [prevYear] = selectedMonth.split('-');
      if (prevYear === selectedYear && hasMonth(selectedMonth)) {
        return selectedMonth;
      }
      return defaultSelection;
    })();
    if (desiredMonth !== selectedMonth) {
      setSelectedMonth(desiredMonth);
    }
  }

  const handleYearClick = (year: string) => {
    if (selectedYear === year) {
      setSelectedYear(null);
      return;
    }

    setSelectedYear(year);
    setSelectedMonth((previousMonth) => {
      if (previousMonth && previousMonth.startsWith(`${year}-`) && hasMonth(previousMonth)) {
        return previousMonth;
      }

      return getDefaultYearMonth(year);
    });
  };

  return (
    <>
      <div className={styles.yearContainer}>
        {sortedYears.map((year) => {
          const isActive = selectedYear === year;
          const isNothingSelected = selectedYear === null;

          return (
            <div key={year}>
              <Button
                className={classnames(styles.year, {
                  [styles.inactive]: !isNothingSelected && !isActive,
                })}
                onClick={() => handleYearClick(year)}
              >
                {year}
              </Button>

              {selectedYear === year &&
                Object.keys(dataByYear[year])
                  .sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
                  .map((month) => {
                    const yearMonth = `${year}-${month}`;
                    const isMonthActive = selectedMonth === yearMonth;
                    return (
                      <button
                        key={yearMonth}
                        type="button"
                        className={classnames(styles.monthLink, {
                          [styles.active]: isMonthActive,
                        })}
                        onClick={() => setSelectedMonth(yearMonth)}
                      >
                        {format(parseISO(`${year}-${month}-01`), 'MMMM')}
                      </button>
                    );
                  })}
            </div>
          );
        })}
      </div>

      {selectedMonth && hasMonth(selectedMonth) ? (
        <VisualizedData yearMonth={selectedMonth} />
      ) : (
        <div className={styles.emptySelection}>Select a year and month to view report.</div>
      )}
    </>
  );
};

const MonthlyReportsPageWithSidebar = withSidebar()(MonthlyReportsPage);
export default MonthlyReportsPageWithSidebar;
