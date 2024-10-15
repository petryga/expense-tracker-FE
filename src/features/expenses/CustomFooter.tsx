import { createContext, Dispatch, useContext } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import styles from './ExpensesPage.module.css';

interface FooterProps {
  setOpenConfirmationModal: Dispatch<React.SetStateAction<boolean>>;
}

export const Context = createContext<{
  totalSelectedCad: number | null;
  totalSelectedUsd: number | null;
  expensesTotalAmountCad?: number;
  expensesTotalAmountUsd?: number;
} | null>(null);

export const CustomFooter = ({ setOpenConfirmationModal }: FooterProps) => {
  const { totalSelectedCad, totalSelectedUsd, expensesTotalAmountCad, expensesTotalAmountUsd } =
    useContext(Context) || {};

  return (
    <div className={styles.footer}>
      {totalSelectedCad || totalSelectedUsd
        ? `Total Amount of Selected Entries - ${totalSelectedCad?.toFixed(
            2
          )}$ (CAD) / ${totalSelectedUsd?.toFixed(2)}$ (USD)`
        : `Total Expenses This Month - ${expensesTotalAmountCad}$ (CAD) / ${expensesTotalAmountUsd}$ (USD)`}

      <div
        title="Download All Expenses"
        className={styles.downloadButton}
        onClick={() => setOpenConfirmationModal(true)}
      >
        <DownloadIcon />
      </div>
    </div>
  );
};
