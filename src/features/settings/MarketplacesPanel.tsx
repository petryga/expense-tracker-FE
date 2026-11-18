import { type FC, type FormEvent, useState } from 'react';
import { Button, IconButton, TextField } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  useAddMarketplaceMutation,
  useDeleteMarketplaceMutation,
  useGetMarketplacesQuery,
} from '../../services/marketplaces/marketplacesApi';
import styles from './AccountsPanel.module.css';

// Marketplaces you buy on. A new expense whose description starts with one of
// these ("eBay - phone case") is marked with it, so searches for the
// marketplace find it even when the description names the item.
export const MarketplacesPanel: FC = () => {
  const { data: marketplaces } = useGetMarketplacesQuery();
  const [addMarketplace] = useAddMarketplaceMutation();
  const [deleteMarketplace] = useDeleteMarketplaceMutation();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const onAdd = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const result = await addMarketplace(trimmed);
    if ('error' in result) {
      const status = (result.error as { status?: number }).status;
      setError(status === 409 ? 'Already on the list.' : 'Could not add it. Try again.');
      return;
    }
    setError('');
    setName('');
  };

  return (
    <div className={styles.panel}>
      <p className={styles.help}>
        New expenses whose description starts with one of these get it as their merchant, so a
        search for the marketplace finds them. Items from split Amazon orders are marked Amazon
        automatically.
      </p>
      <form className={styles.addAccountRow} onSubmit={onAdd}>
        <TextField
          label="New marketplace"
          size="small"
          value={name}
          slotProps={{ htmlInput: { maxLength: 100 } }}
          error={!!error}
          helperText={error || undefined}
          onChange={(event) => {
            setName(event.target.value);
            setError('');
          }}
        />
        <Button type="submit" startIcon={<FontAwesomeIcon icon={faPlus as IconProp} />}>
          Add marketplace
        </Button>
      </form>

      {(marketplaces ?? []).length === 0 && <p className={styles.help}>None yet.</p>}
      {(marketplaces ?? []).map((marketplace) => (
        <div key={marketplace.id} className={styles.accountRow}>
          <span className={styles.accountName}>{marketplace.name}</span>
          <span />
          <IconButton
            size="small"
            aria-label={`Remove ${marketplace.name}`}
            onClick={() => void deleteMarketplace(marketplace.id)}
          >
            <FontAwesomeIcon icon={faTrash as IconProp} className={styles.icon} size="xs" />
          </IconButton>
        </div>
      ))}
    </div>
  );
};
