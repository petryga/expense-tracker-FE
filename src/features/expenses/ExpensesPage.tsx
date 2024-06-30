import { FC, useEffect, useState } from 'react';
import { withSidebar } from '../../components/sidebar/withSideBar';
import { format, parseISO } from 'date-fns';
import { useGetExpensesQuery } from '../../services/expenses/expensesApi';
import { ExpensesDataGrid } from './ExpensesDataGrid';
import { getCurrentMonthPath, getDataByMonth } from './helpers';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import styles from './ExpensesPage.module.css';
import classNames from 'classnames';
import type { Data } from '../../services/expenses/expensesApi.types';

const ExpensesPage: FC = () => {
  const { data: { data: allData } = {}, isLoading } = useGetExpensesQuery({});
  const [rows, setRows] = useState<Data[]>([]);

  useEffect(() => {
    if (allData) {
      setRows(allData);
    }
  }, [allData]);

  const dataByMonth = getDataByMonth(rows);
  const location = useLocation();

  if (isLoading) return <></>;

  return (
    <div>
      {Object.keys(dataByMonth).map((month, index) => {
        const path = `/expenses/${month}`;
        const isActive = location.pathname.includes(path);

        return (
          <Link
            key={index}
            to={path}
            className={classNames(styles.monthLink, {
              [styles.active]: isActive,
            })}
          >
            {format(parseISO(month + '-01'), 'MMMM yyyy')}
          </Link>
        );
      })}

      <Routes>
        <Route path="*" element={<Navigate to={getCurrentMonthPath()} />} />
        {Object.keys(dataByMonth).map((_, index) => (
          <Route key={index} path=":yearMonth" element={<ExpensesDataGrid />} />
        ))}
      </Routes>
    </div>
  );
};

const ExpensesPageWithSideBar = withSidebar()(ExpensesPage);
export default ExpensesPageWithSideBar;
