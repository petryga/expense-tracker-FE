import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import styles from './ExpensesPage.module.css';
import { GridFilterModel } from '@mui/x-data-grid';

interface FooterProps {
  setOpenConfirmationModal: Dispatch<React.SetStateAction<boolean>>;
  filterModel: GridFilterModel;
  setFilterModel: Dispatch<SetStateAction<GridFilterModel>>;
}

export const Context = createContext<{
  totalSelectedCad: number | null;
  totalSelectedUsd: number | null;
  expensesTotalAmountCad?: number;
  expensesTotalAmountUsd?: number;
} | null>(null);

export const CustomFooter = ({
  setOpenConfirmationModal,
  filterModel,
  setFilterModel,
}: FooterProps) => {
  const { totalSelectedCad, totalSelectedUsd, expensesTotalAmountCad, expensesTotalAmountUsd } =
    useContext(Context) || {};

  const isFilterOn = filterModel.items.length > 0;
  return (
    <div className={styles.footer}>
      {totalSelectedCad || totalSelectedUsd
        ? `Total Amount of Selected Entries - ${totalSelectedCad?.toFixed(
            2
          )}$ (CAD) / ${totalSelectedUsd?.toFixed(2)}$ (USD)`
        : isFilterOn
        ? null
        : `Total Expenses This Month - ${expensesTotalAmountCad}$ (CAD) / ${expensesTotalAmountUsd}$ (USD)`}

      {!isFilterOn && (
        <div
          title="Download All Expenses"
          className={styles.downloadButton}
          onClick={() => setOpenConfirmationModal(true)}
        >
          <DownloadIcon />
        </div>
      )}

      {/* {isFilterOn && (
        <div
          className={styles.clearFilter}
          onClick={(e) => {
            e.preventDefault();

            setFilterModel((prev) => ({ ...prev, items: [] }));
            console.log('clear filter');
          }}
        >
          Clear Filter
        </div>
      )} */}
    </div>
  );
};
