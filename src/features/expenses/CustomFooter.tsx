import { createContext, useContext } from 'react';
import styles from './ExpensesPage.module.css';

export const Context = createContext<{
  totalSelected: number | null;
  expensesTotalAmount?: number;
} | null>(null);

export const CustomFooter = () => {
  const { totalSelected, expensesTotalAmount } = useContext(Context) || {};

  return (
    <div className={styles.footer}>
      {totalSelected
        ? `Total Amount of Selected Entries - ${totalSelected?.toFixed(2)}$`
        : `Total Expenses This Month - ${expensesTotalAmount}$`}
    </div>
  );
};
