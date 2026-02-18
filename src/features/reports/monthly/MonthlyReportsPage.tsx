import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useGetExpensesQuery } from '../../../services/expenses/expensesApi';
import { getDataByMonth, processExpensesData } from '../../expenses/helpers';
import { format, parseISO } from 'date-fns';
import { Button } from '@mui/material';
import { withSidebar } from '../../../components/sidebar/withSideBar';
import { VisualizedData } from './VisualizedData';
import classnames from 'classnames';
import styles from './MonthlyReportsPage.module.css';

const MonthlyReportsPage: FC = () => {
  const { data: { data: expenses } = {} } = useGetExpensesQuery({});
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const dataByMonth = getDataByMonth(expenses);
  const dataByYear = useMemo(() => processExpensesData(expenses), [expenses]);
  const sortedYears = useMemo(
    () => Object.keys(dataByYear).sort((a, b) => Number.parseInt(b) - Number.parseInt(a)),
    [dataByYear]
  );

  const getDefaultYearMonth = useCallback(
    (year: string): string | null => {
      if (!dataByYear[year]) {
        return null;
      }

      const monthsForYear = Object.keys(dataByYear[year]).sort(
        (a, b) => Number.parseInt(b) - Number.parseInt(a)
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
    [dataByYear]
  );

  useEffect(() => {
    if (!sortedYears.length) {
      setSelectedYear(null);
      return;
    }

    const currentYear = format(new Date(), 'yyyy');
    setSelectedYear((previousYear) => {
      if (previousYear && sortedYears.includes(previousYear)) {
        return previousYear;
      }
      return sortedYears.includes(currentYear) ? currentYear : sortedYears[0];
    });
  }, [sortedYears]);

  useEffect(() => {
    if (!selectedYear || !dataByYear[selectedYear]) {
      return;
    }
    const defaultSelection = getDefaultYearMonth(selectedYear);

    setSelectedMonth((previousMonth) => {
      if (!defaultSelection) {
        return null;
      }
      if (!previousMonth) {
        return defaultSelection;
      }
      const [prevYear] = previousMonth.split('-');
      if (prevYear === selectedYear && dataByMonth[previousMonth]) {
        return previousMonth;
      }
      return defaultSelection;
    });
  }, [dataByMonth, dataByYear, getDefaultYearMonth, selectedYear]);

  const handleYearClick = (year: string) => {
    if (selectedYear === year) {
      setSelectedYear(null);
      return;
    }

    setSelectedYear(year);
    setSelectedMonth((previousMonth) => {
      if (previousMonth && previousMonth.startsWith(`${year}-`) && dataByMonth[previousMonth]) {
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

      {selectedMonth && dataByMonth[selectedMonth] ? (
        <VisualizedData dataByMonth={dataByMonth[selectedMonth]} />
      ) : (
        <div className={styles.emptySelection}>Select a year and month to view report.</div>
      )}
    </>
  );
};

const MonthlyReportsPageWithSidebar = withSidebar()(MonthlyReportsPage);
export default MonthlyReportsPageWithSidebar;
