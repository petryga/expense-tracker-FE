import { FC, useState } from 'react';
import { withSidebar } from '../../../components/sidebar/withSideBar';
import { useGetMonthlyDataQuery } from '../../../services/monthlyData/monthlyDataApi';
import { useGetIncomeEntriesQuery } from '../../../services/income/incomeApi';
import { useGetRecurringIncomeQuery } from '../../../services/recurringIncome/recurringIncomeApi';
import { UrlTabs } from '../../../components/urlTabs/UrlTabs';
import { useActiveTabId } from '../../../components/urlTabs/useActiveTabId';
import { getRecurringWealthOptions } from './helpers';
import { ALL_WEALTH } from './WealthTracker';
import { buildAllTimeReportSections } from './AllTimeReportsPage.sections';
import styles from './AllTimeReportsPage.module.css';

const MONTH_RANGE_OPTIONS = [
  { label: 'Last 3 months', value: '3' },
  { label: 'Last 6 months', value: '6' },
  { label: 'Last year', value: '12' },
  { label: 'Last 2 years', value: '24' },
  { label: 'All time', value: 'all' },
];

const AllTimeReportsPage: FC = () => {
  const [monthRange, setMonthRange] = useState<number | null>(12);
  const [wealthKey, setWealthKey] = useState(ALL_WEALTH);
  const { data } = useGetMonthlyDataQuery({});
  const { data: incomeEntries } = useGetIncomeEntriesQuery({});
  const { data: recurringIncome } = useGetRecurringIncomeQuery({});
  const wealthOptions = getRecurringWealthOptions(recurringIncome);
  const activeWealthKey = wealthOptions.some((o) => o.key === wealthKey) ? wealthKey : ALL_WEALTH;
  const sections = buildAllTimeReportSections(data, monthRange, incomeEntries, activeWealthKey);
  const activeTabId = useActiveTabId(sections.map((section) => section.id));

  return (
    <UrlTabs
      sections={sections}
      belowNav={
        activeTabId !== 'yearly-comparison' && (
          <div className={styles.controls}>
            <div className={styles.field}>
              <label htmlFor="month-range">Range</label>
              <select
                id="month-range"
                value={monthRange === null ? 'all' : String(monthRange)}
                onChange={(event) =>
                  setMonthRange(event.target.value === 'all' ? null : Number(event.target.value))
                }
              >
                {MONTH_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {activeTabId === 'monthly-wealth' && wealthOptions.length > 0 && (
              <div className={styles.field}>
                <label htmlFor="wealth-category">Category</label>
                <select
                  id="wealth-category"
                  value={activeWealthKey}
                  onChange={(event) => setWealthKey(event.target.value)}
                >
                  <option value={ALL_WEALTH}>All (total)</option>
                  {wealthOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )
      }
    />
  );
};

const AllTimeReportsPageWithSidebar = withSidebar()(AllTimeReportsPage);
export default AllTimeReportsPageWithSidebar;
