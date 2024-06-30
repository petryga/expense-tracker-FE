import { FC, useEffect, useState } from 'react';
import { useGetExpensesQuery } from '../../../services/expenses/expensesApi';
import { getDataByMonth } from '../../expenses/helpers';
import { format, parseISO } from 'date-fns';
import { Tab, Tabs } from '@mui/material';
import { tabsStyles } from '../../expenses/styles';
import { withSidebar } from '../../../components/sidebar/withSideBar';
import { VisualizedData } from './VisualizedData';

const MonthlyReportsPage: FC = () => {
  const { data: { data: expenses } = {} } = useGetExpensesQuery({});
  const [value, setValue] = useState(0);
  const dataByMonth = getDataByMonth(expenses);

  useEffect(() => {
    if (expenses) {
      const currentMonth = format(new Date(), 'yyyy-MM');
      const months = Object.keys(dataByMonth);
      const currentMonthIndex = months.indexOf(currentMonth);
      setValue(currentMonthIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses]);

  const TABLE_CONFIG = Object.keys(dataByMonth)?.map((month) => ({
    label: format(parseISO(month + '-01'), 'MMMM yyyy'),
    ContentComponent: VisualizedData,
    componentProps: {
      dataByMonth: dataByMonth[month],
    },
  }));

  return (
    <>
      <Tabs
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        variant="fullWidth"
        sx={tabsStyles}
      >
        {TABLE_CONFIG?.map((tab, index) => (
          <Tab key={index} label={tab.label} id={`tab-${index}`} />
        ))}
      </Tabs>

      {TABLE_CONFIG?.map((tab, index) => (
        <div key={index} role="tabpanel" hidden={value !== index}>
          {value === index && <tab.ContentComponent {...tab.componentProps} />}
        </div>
      ))}
    </>
  );
};

const MonthlyReportsPageWithSidebar = withSidebar()(MonthlyReportsPage);
export default MonthlyReportsPageWithSidebar;
