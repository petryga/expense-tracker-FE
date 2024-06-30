import { createContext, useContext } from 'react';
import styles from './IncomePage.module.css';

export const Context = createContext<{ totalSelected: number | null } | null>(null);

export const CustomFooter = () => {
  const { totalSelected } = useContext(Context) || {};

  return (
    <div className={styles.footer}>
      {totalSelected ? `Total Amount of Selected Entries - ${totalSelected?.toFixed(2)}$` : ''}
    </div>
  );
};
