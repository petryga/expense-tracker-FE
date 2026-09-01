import { FC, useState } from 'react';
import { withSidebar } from '../../../components/sidebar/withSideBar';
import { useGetMonthlyDataQuery } from '../../../services/monthlyData/monthlyDataApi';
import { UrlTabs } from '../../../components/urlTabs/UrlTabs';
import { useActiveTabId } from '../../../components/urlTabs/useActiveTabId';
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
  const { data } = useGetMonthlyDataQuery({});
  const sections = buildAllTimeReportSections(data, monthRange);
  const activeTabId = useActiveTabId(sections.map((section) => section.id));

  return (
    <UrlTabs
      sections={sections}
      belowNav={
        activeTabId !== 'yearly-comparison' && (
          <div className={styles.rangeControl}>
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
        )
      }
    />
  );
};

const AllTimeReportsPageWithSidebar = withSidebar()(AllTimeReportsPage);
export default AllTimeReportsPageWithSidebar;
