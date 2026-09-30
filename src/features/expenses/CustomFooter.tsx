import { Dispatch, SetStateAction, useContext } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import styles from './ExpensesPage.module.css';
import { GridFilterModel } from '@mui/x-data-grid';
import { Context } from './FooterContext';
import { formatAmount } from '../../utils';

interface FooterProps {
  setOpenConfirmationModal: Dispatch<React.SetStateAction<boolean>>;
  filterModel: GridFilterModel;
  setFilterModel: Dispatch<SetStateAction<GridFilterModel>>;
  hasEntries: boolean;
}

export const CustomFooter = ({
  setOpenConfirmationModal,
  filterModel,
  setFilterModel: _setFilterModel,
  hasEntries,
}: FooterProps) => {
  const { totalSelectedCad, totalSelectedUsd, expensesTotalAmountCad, expensesTotalAmountUsd } =
    useContext(Context) || {};

  const isFilterOn = filterModel.items.length > 0;

  const formatAmounts = (cad?: number | null, usd?: number | null) => {
    const cadAmount = Number(cad) || 0;
    const usdAmount = Number(usd) || 0;
    return [
      cadAmount > 0 ? `${formatAmount(cadAmount)}$ (CAD)` : null,
      usdAmount > 0 ? `${formatAmount(usdAmount)}$ (USD)` : null,
    ].filter(Boolean);
  };

  const selectedTotalParts = formatAmounts(totalSelectedCad, totalSelectedUsd);
  const monthlyTotalParts = formatAmounts(expensesTotalAmountCad, expensesTotalAmountUsd);

  return (
    <div className={styles.footer}>
      {selectedTotalParts.length
        ? `Total Amount of Selected Entries - ${selectedTotalParts.join(' / ')}`
        : isFilterOn || !monthlyTotalParts.length
          ? null
          : `Total Expenses This Month - ${monthlyTotalParts.join(' / ')}`}

      {!isFilterOn && hasEntries && (
        <div
          title="Download All Expenses"
          className={styles.downloadButton}
          onClick={() => setOpenConfirmationModal(true)}
        >
          <DownloadIcon />
        </div>
      )}
    </div>
  );
};
