import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { groupMonthlyData } from './helpers';
import { MonthlyData, MonthlyDataTypes } from '../../../services/monthlyData/monthlyData.types';
import { CustomDot } from './CustomDot';

export const WealthTracker = ({ data }: { data?: MonthlyData[] }) => {
  const monthlyAssets = Object.values(groupMonthlyData(MonthlyDataTypes.Income, data));
  if (!monthlyAssets.length) return <div> No data</div>;

  return (
    <>
      <h1>Wealth Tracker</h1>

      <LineChart
        width={1000}
        height={600}
        data={monthlyAssets}
        margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="yearMonth" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" dot={<CustomDot />} />
      </LineChart>
    </>
  );
};
