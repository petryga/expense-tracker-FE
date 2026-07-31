import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { groupMonthlyData, getYAxisMax } from "./helpers";
import {
  MonthlyData,
  MonthlyDataTypes,
} from "../../../services/monthlyData/monthlyData.types";
import { CustomDot } from "./CustomDot";
import styles from "./YearlyComparison.module.css";

export const WealthTracker = ({
  data,
  monthRange = null,
}: {
  data?: MonthlyData[];
  monthRange?: number | null;
}) => {
  const allMonthlyAssets = groupMonthlyData(MonthlyDataTypes.Income, data);
  const monthlyAssets = monthRange ? allMonthlyAssets.slice(-monthRange) : allMonthlyAssets;

  if (!monthlyAssets.length) return <div> No data</div>;

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width={1000} height={600}>
        <LineChart
          data={monthlyAssets}
          margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="yearMonth" />
          <YAxis domain={[0, getYAxisMax(monthlyAssets)]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="amountCad"
            stroke="#8884d8"
            dot={<CustomDot />}
          />
          <Line
            type="monotone"
            dataKey="amountUsd"
            stroke="red"
            dot={<CustomDot />}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
