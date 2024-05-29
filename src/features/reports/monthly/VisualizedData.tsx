import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList, Tooltip } from 'recharts';
import { getVisualizedData } from './helpers';

import styles from './MonthlyReportsPage.module.css';
import { DataByCategory } from '../../expenses/ExpensesPage.types';
import { Data } from '../../../services/expenses/expensesApi.types';

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: {
    payload: DataByCategory;
  }[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.tooltip}>
        <ul>
          {data.details.map((item, index) => (
            <li key={index}>
              {item.description} - ${item.amount.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};

export const VisualizedData = ({ dataByMonth }: { dataByMonth: Data[] }) => {
  const { dataByCategory, totalSpent } = useMemo(
    () => getVisualizedData(dataByMonth),
    [dataByMonth]
  );

  return (
    <div className={styles.container}>
      <BarChart
        width={1000}
        height={650}
        min-height={400}
        data={dataByCategory}
        layout="vertical"
        margin={{ top: 5, bottom: 5, left: 30, right: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="category" type="category" width={60} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" barSize={20} fill="#8884d8">
          {dataByCategory.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
          <LabelList
            dataKey="total"
            position="right"
            style={{ fill: '#666', fontWeight: 'bold' }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
          />
        </Bar>
      </BarChart>

      <div className={styles.summary}>
        <h2>Total Spent Across All Categories (not including rent) - ${totalSpent}</h2>
      </div>
    </div>
  );
};
