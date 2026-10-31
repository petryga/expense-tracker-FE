import { FC, useState } from 'react';
import { withSidebar } from '../../../components/sidebar/withSideBar';
import { useGetMonthlyDataQuery } from '../../../services/monthlyData/monthlyDataApi';
import { MonthlyDataTypes } from '../../../services/monthlyData/monthlyData.types';
import { useGetRecurringIncomeQuery } from '../../../services/recurringIncome/recurringIncomeApi';
import { UrlTabs } from '../../../components/urlTabs/UrlTabs';
import { useActiveTabId } from '../../../components/urlTabs/useActiveTabId';
import { ALL_WEALTH, getRecurringWealthOptions } from './helpers';
import { buildAllTimeReportSections } from './AllTimeReportsPage.sections';
import styles from './AllTimeReportsPage.module.css';

const MONTH_RANGE_OPTIONS = [
  { label: 'Last 3 months', value: '3' },
  { label: 'Last 6 months', value: '6' },
  { label: 'Last year', value: '12' },
  { label: 'Last 2 years', value: '24' },
  { label: 'All time', value: 'all' },
];

export const AllTimeReportsPage: FC = () => {
  const [monthRange, setMonthRange] = useState<number | null>(12);
  const [wealthKey, setWealthKey] = useState(ALL_WEALTH);
  const { data } = useGetMonthlyDataQuery({}, { refetchOnMountOrArgChange: true });
  const { data: recurringIncome } = useGetRecurringIncomeQuery({});
  const wealthOptions = getRecurringWealthOptions(recurringIncome);
  const selectedWealth = wealthOptions.find((option) => option.key === wealthKey);
  const activeWealthKey = selectedWealth ? wealthKey : ALL_WEALTH;
  // The BE sums the selected category/currency; nothing is fetched until one is
  // picked, and "All (total)" reuses the unfiltered query above.
  const { data: categoryData } = useGetMonthlyDataQuery(
    {
      type: MonthlyDataTypes.Income,
      category: selectedWealth?.category,
      currency: selectedWealth?.currency,
    },
    { skip: !selectedWealth, refetchOnMountOrArgChange: true },
  );
  const sections = buildAllTimeReportSections(
    data,
    monthRange,
    selectedWealth ? categoryData : data,
  );
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
