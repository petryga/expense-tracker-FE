import { createContext, useContext } from 'react';
import styles from './IncomePage.module.css';

export const Context = createContext<{
  totalSelectedCad: number | null;
  totalSelectedUsd?: number | null;
} | null>(null);

export const CustomFooter = () => {
  const { totalSelectedCad, totalSelectedUsd } = useContext(Context) || {};

  return (
    <div className={styles.footer}>
      {totalSelectedCad || totalSelectedUsd
        ? `Total Amount of Selected Entries - ${totalSelectedCad?.toFixed(
            2
          )}$ (CAD) / ${totalSelectedUsd?.toFixed(2)}$ (USD)`
        : ''}
    </div>
  );
};
