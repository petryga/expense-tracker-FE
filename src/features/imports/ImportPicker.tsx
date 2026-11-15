import type { FC } from 'react';
import { MenuItem, TextField } from '@mui/material';
import type { ImportSummary } from '../../services/imports/importsApi.types';
import styles from './ImportsPage.module.css';

const optionLabel = (batch: ImportSummary) =>
  `${batch.fileName} · ${new Date(batch.createdAt).toLocaleDateString()} · ${
    batch.draftCount ? `${batch.draftCount} to review` : 'done'
  }`;

// One dropdown, newest first, so 50 files take the same space as 2.
export const ImportPicker: FC<{
  imports: ImportSummary[];
  selectedId?: string;
  onSelect: (id: string) => void;
}> = ({ imports, selectedId, onSelect }) => (
  <div className={styles.importsBar}>
    <TextField
      select
      size="small"
      // An id that isn't in the list (a deleted import) shows the placeholder.
      value={imports.some((b) => b.id === selectedId) ? selectedId : ''}
      onChange={(e) => onSelect(e.target.value)}
      sx={{
        width: 420,
        maxWidth: '100%',
        // Same surface and shadow as the panels and the Search bar.
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'var(--surface)',
          boxShadow: '0 2px 6px 0 var(--shadow-color)',
          borderRadius: 0,
        },
      }}
      slotProps={{
        select: {
          displayEmpty: true,
          // No floating label (it cut a gap into the top border) and no
          // placeholder option in the open list: the placeholder is drawn here.
          renderValue: (value) => {
            const batch = imports.find((b) => b.id === value);
            return batch ? optionLabel(batch) : `Choose an import (${imports.length})`;
          },
          inputProps: { 'aria-label': 'Imports' },
        },
      }}
    >
      {imports.map((batch) => (
        <MenuItem key={batch.id} value={batch.id}>
          {optionLabel(batch)}
        </MenuItem>
      ))}
    </TextField>
  </div>
);
