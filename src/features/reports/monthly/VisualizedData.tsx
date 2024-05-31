import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { getVisualizedData } from './helpers';
import styles from './MonthlyReportsPage.module.css';
import type { Data } from '../../../services/expenses/expensesApi.types';
import { CustomBarShape, CustomTooltip } from './components';

export const VisualizedData = ({ dataByMonth }: { dataByMonth: Data[] }) => {
  const { dataByCategory, totalSpent } = useMemo(
    () => getVisualizedData(dataByMonth),
    [dataByMonth]
  );

  const maxSpent = Math.max(...dataByCategory.map((item) => item.total));
  const ticks = Array.from({ length: Math.ceil(maxSpent / 100) + 1 }, (_, i) => i * 100);

  return (
    <div className={styles.container}>
      <BarChart
        width={1200}
        height={650}
        min-height={400}
        data={dataByCategory}
        layout="vertical"
        margin={{ top: 5, bottom: 5, left: 30, right: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" ticks={ticks} tickFormatter={(tick) => tick.toString()} />
        <YAxis dataKey="category" type="category" width={60} />
        <Tooltip content={<CustomTooltip />} />

        <Bar dataKey="total" barSize={20} fill="#8884d8" shape={<CustomBarShape />}>
          {dataByCategory.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}

          <LabelList
            dataKey="total"
            position="right"
            style={{ fill: '#666', fontWeight: 'bold' }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
            overflow={'extendDomain'}
          />
        </Bar>

        {dataByCategory.map(({ budget, total, category }, index) => {
          const isShown = budget && budget < total;

          return (
            <>
              {isShown ? (
                <ReferenceLine
                  key={`ref-${index}`}
                  y={category}
                  stroke="transparent"
                  strokeDasharray="2 3"
                  label={{
                    value: `$${budget}`,
                    position: 'insideRight',
                    fill: 'red',
                    fontWeight: 'bold',
                  }}
                  ifOverflow="extendDomain"
                />
              ) : (
                <></>
              )}
            </>
          );
        })}
      </BarChart>

      <div className={styles.summary}>
        <h2>Total Spent Across All Categories (not including rent) - ${totalSpent}</h2>
      </div>
    </div>
  );
};
