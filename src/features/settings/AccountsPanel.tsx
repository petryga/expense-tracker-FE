import { FC, useState } from 'react';
import { Button, IconButton, MenuItem, Select, TextField } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  useCreateAccountMutation,
  useDeleteAccountMutation,
  useGetAccountsQuery,
} from '../../services/accounts/accountsApi';
import { Currency } from '../expenses/helpers';
import WarningModal from '../../components/warningModal/WarningModal';
import styles from './AccountsPanel.module.css';

export const AccountsPanel: FC = () => {
  const { data: accounts } = useGetAccountsQuery({});
  const [createAccount] = useCreateAccountMutation();
  const [deleteAccount] = useDeleteAccountMutation();

  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountCurrency, setNewAccountCurrency] = useState<Currency>(Currency.USD);
  const [openModal, setOpenModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) return;
    await createAccount({
      data: { name: newAccountName.trim(), currency: newAccountCurrency },
    }).unwrap();
    setNewAccountName('');
  };

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
    setOpenModal(true);
  };

  const handleDelete = () => {
    if (pendingDeleteId) {
      deleteAccount({ id: pendingDeleteId });
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.addAccountRow}>
        <TextField
          label="New account name"
          size="small"
          value={newAccountName}
          onChange={(event) => setNewAccountName(event.target.value)}
        />
        <Select
          className={styles.currencySelect}
          size="small"
          value={newAccountCurrency}
          onChange={(event) => setNewAccountCurrency(event.target.value as Currency)}
        >
          <MenuItem value={Currency.CAD}>{Currency.CAD}</MenuItem>
          <MenuItem value={Currency.USD}>{Currency.USD}</MenuItem>
        </Select>
        <Button
          startIcon={<FontAwesomeIcon icon={faPlus as IconProp} />}
          onClick={handleAddAccount}
        >
          Add account
        </Button>
      </div>

      {(accounts ?? []).map((account) => (
        <div key={account.id} className={styles.accountRow}>
          <div className={styles.nameGroup}>
            <span className={styles.accountName}>{account.name}</span>
            {account.isDefault && <span className={styles.defaultLabel}>Default</span>}
          </div>
          <span className={styles.currencyLabel}>{account.currency}</span>
          {!account.isDefault ? (
            <IconButton size="small" onClick={() => handleDeleteClick(account.id)}>
              <FontAwesomeIcon icon={faTrash as IconProp} className={styles.icon} size="xs" />
            </IconButton>
          ) : (
            <span />
          )}
        </div>
      ))}

      <WarningModal open={openModal} setOpen={setOpenModal} onDelete={handleDelete} />
    </div>
  );
};
