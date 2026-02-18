import { FC, useState } from "react";
import { withSidebar } from "../../../components/sidebar/withSideBar";
import { useGetMonthlyDataQuery } from "../../../services/monthlyData/monthlyDataApi";

import { Tab, Tabs } from "@mui/material";
import { tabsStyles } from "../../expenses/styles";
import { MonthlyExpenses } from "./MonthlyExpenses";
import { WealthTracker } from "./WealthTracker";
import { YearlyComparison } from "./YearlyComparison";

const AllTimeReportsPage: FC = () => {
  const [value, setValue] = useState(0);
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

      {value === 0 && <MonthlyExpenses data={data} />}
      {value === 1 && <WealthTracker data={data} />}
      {value === 2 && <YearlyComparison data={data} />}
    </>
  );
};

const AllTimeReportsPageWithSidebar = withSidebar()(AllTimeReportsPage);
export default AllTimeReportsPageWithSidebar;
