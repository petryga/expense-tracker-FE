import { useContext } from 'react';
import styles from './AssetsPage.module.css';
import { Context } from './FooterContext';

export const CustomFooter = () => {
  const { totalSelectedCad, totalSelectedUsd } = useContext(Context) || {};

  const visible = totalSelectedCad || totalSelectedUsd;

  return (
    <div className={`${styles.footer} ${visible ? styles.footerVisible : styles.footerHidden}`}>
      {visible && (
        <div>
          Total Amount of Selected Entries - ${totalSelectedCad?.toFixed(2)}$ (CAD) / $
          {totalSelectedUsd?.toFixed(2)}$ (USD)
        </div>
      )}
    </div>
  );
};
