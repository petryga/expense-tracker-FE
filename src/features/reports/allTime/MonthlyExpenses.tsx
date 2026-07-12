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
  type MonthlyData,
  MonthlyDataTypes,
} from "../../../services/monthlyData/monthlyData.types";
import { CustomDot } from "./CustomDot";

export const MonthlyExpenses = ({
  data,
  monthRange = null,
}: {
  data?: MonthlyData[];
  monthRange?: number | null;
}) => {
  const allMonthlyExpenses = groupMonthlyData(MonthlyDataTypes.Expense, data);
  const monthlyExpenses = monthRange
    ? allMonthlyExpenses.slice(-monthRange)
    : allMonthlyExpenses;

  if (!monthlyExpenses.length) return <div>No data</div>;

  return (
    <>
      <h1>Monthly Expense Tracker</h1>
      <ResponsiveContainer width={1000} height={600}>
        <LineChart
          data={monthlyExpenses}
          margin={{ right: 50, left: -15, top: 15 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="yearMonth" />
          <YAxis domain={[0, getYAxisMax(monthlyExpenses)]} />
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
    </>
  );
};
