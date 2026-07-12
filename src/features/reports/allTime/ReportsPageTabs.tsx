import { FC, useState } from "react";
import { withSidebar } from "../../../components/sidebar/withSideBar";
import { useGetMonthlyDataQuery } from "../../../services/monthlyData/monthlyDataApi";

import { Tab, Tabs } from "@mui/material";
import { tabsStyles } from "../../expenses/styles";
import { MonthlyExpenses } from "./MonthlyExpenses";
import { WealthTracker } from "./WealthTracker";
import { YearlyComparison } from "./YearlyComparison";
import styles from "./ReportsPageTabs.module.css";

const MONTH_RANGE_OPTIONS = [
  { label: "Last 3 months", value: "3" },
  { label: "Last 6 months", value: "6" },
  { label: "Last year", value: "12" },
  { label: "Last 2 years", value: "24" },
  { label: "All time", value: "all" },
];

const AllTimeReportsPage: FC = () => {
  const [value, setValue] = useState(0);
  const [monthRange, setMonthRange] = useState<number | null>(12);
  const { data } = useGetMonthlyDataQuery({});

  return (
    <>
      <Tabs
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        variant="fullWidth"
        sx={tabsStyles}
      >
        <Tab label="Monthly Expenses" />
        <Tab label="Monthly Wealth" />
        <Tab label="Yearly Comparison" />
      </Tabs>

      {value !== 2 && (
        <div className={styles.rangeControl}>
          <label htmlFor="month-range">Range</label>
          <select
            id="month-range"
            value={monthRange === null ? "all" : String(monthRange)}
            onChange={(event) =>
              setMonthRange(event.target.value === "all" ? null : Number(event.target.value))
            }
          >
            {MONTH_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {value === 0 && <MonthlyExpenses data={data} monthRange={monthRange} />}
      {value === 1 && <WealthTracker data={data} monthRange={monthRange} />}
      {value === 2 && <YearlyComparison data={data} />}
    </>
  );
};

const AllTimeReportsPageWithSidebar = withSidebar()(AllTimeReportsPage);
export default AllTimeReportsPageWithSidebar;
