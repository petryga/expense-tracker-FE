import { DataByCategory } from '../../expenses/ExpensesPage.types';
import { Currency } from '../../expenses/helpers';
import styles from './MonthlyReportsPage.module.css';

export const CustomTooltip = ({
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
          {data.details.map(({ description, amount, currency }, index) => (
            <li key={index}>
              {description} - ${amount.toFixed(2)}{' '}
              {currency === Currency.USD && <span className={styles.currency}>{currency}</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};

export const CustomBarShape = ({ x, y, width, height, fill, budget, total }: any) => {
  const budgetX = x + (width * budget) / total;
  const isExceedingBudget = budget && total > budget;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} />
      {isExceedingBudget && (
        <>
          <line x1={budgetX} y1={y} x2={budgetX} y2={y + height} stroke="red" strokeWidth={1} />
        </>
      )}
    </g>
  );
};
