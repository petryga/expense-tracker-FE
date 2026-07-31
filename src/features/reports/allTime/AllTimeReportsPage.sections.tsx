import type { UrlTabSection } from "../../../components/urlTabs/UrlTabs";
import type { MonthlyData } from "../../../services/monthlyData/monthlyData.types";
import { MonthlyExpenses } from "./MonthlyExpenses";
import { WealthTracker } from "./WealthTracker";
import { YearlyComparison } from "./YearlyComparison";

export const buildAllTimeReportSections = (
  data: MonthlyData[] | undefined,
  monthRange: number | null
): UrlTabSection[] => [
  {
    id: "monthly-expenses",
    label: "Monthly Expenses",
    content: <MonthlyExpenses data={data} monthRange={monthRange} />,
  },
  {
    id: "monthly-wealth",
    label: "Monthly Wealth",
    content: <WealthTracker data={data} monthRange={monthRange} />,
  },
  {
    id: "yearly-comparison",
    label: "Yearly Comparison",
    content: <YearlyComparison data={data} />,
  },
];
