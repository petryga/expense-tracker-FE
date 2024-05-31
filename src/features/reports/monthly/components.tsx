import { DataByCategory } from '../../expenses/ExpensesPage.types';
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

export const CustomBarShape = ({ x, y, width, height, fill, budget, total }: any) => {
  const budgetX = x + (width * budget) / total;
  const isExceedingBudget = budget && total > budget;
  const budgetWidth = width - (width * budget) / total;
  const barWidth = isExceedingBudget ? width - budgetWidth : width;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} />
      {isExceedingBudget && (
        <>
          {/* <rect x={budgetX} y={y} width={budgetWidth} height={height} fill="blue" opacity={0.5} /> */}
          <line x1={budgetX} y1={y} x2={budgetX} y2={y + height} stroke="red" strokeWidth={1} />
        </>
      )}
    </g>
  );
};
