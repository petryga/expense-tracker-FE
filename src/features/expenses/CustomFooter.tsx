import { createContext, Dispatch, useContext } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import styles from './ExpensesPage.module.css';
interface FooterProps {
  setOpenConfirmationModal: Dispatch<React.SetStateAction<boolean>>;
}

export const Context = createContext<{
  totalSelected: number | null;
  expensesTotalAmount?: number;
} | null>(null);

export const CustomFooter = ({ setOpenConfirmationModal }: FooterProps) => {
  const { totalSelected, expensesTotalAmount } = useContext(Context) || {};

  return (
    <div className={styles.footer}>
      {totalSelected
        ? `Total Amount of Selected Entries - ${totalSelected?.toFixed(2)}$`
        : `Total Expenses This Month - ${expensesTotalAmount}$`}

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
