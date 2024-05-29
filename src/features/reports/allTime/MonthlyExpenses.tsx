import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { groupMonthlyData } from './helpers';
import { MonthlyData, MonthlyDataTypes } from '../../../services/monthlyData/monthlyData.types';

export const MonthlyExpenses = ({ data }: { data?: MonthlyData[] }) => {
  const monthlyExpenses = Object.values(groupMonthlyData(MonthlyDataTypes.Expense, data));
  if (!monthlyExpenses.length) return <div> No data </div>;

  return (
    <div>
      <h1>Monthly Expense Tracker</h1>
      <LineChart width={1000} height={600} data={monthlyExpenses}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="yearMonth" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};
