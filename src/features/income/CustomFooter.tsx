import { useContext } from 'react';
import styles from './AssetsPage.module.css';
import { Context } from './FooterContext';
import { formatAmount } from '../../utils';

export const CustomFooter = () => {
  const { totalSelectedCad, totalSelectedUsd } = useContext(Context) || {};

  const visible = totalSelectedCad || totalSelectedUsd;

  return (
    <div className={`${styles.footer} ${visible ? styles.footerVisible : styles.footerHidden}`}>
      {visible && (
        <div>
          Total Amount of Selected Entries - ${formatAmount(totalSelectedCad)}$ (CAD) / $
          {formatAmount(totalSelectedUsd)}$ (USD)
        </div>
      )}
    </div>
  );
};
