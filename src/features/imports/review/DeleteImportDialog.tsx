import type { FC } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { ImportDetail } from '../../../services/imports/importsApi.types';

export const DeleteImportDialog: FC<{
  detail: ImportDetail;
  open: boolean;
  onClose: () => void;
  onConfirm: (keepExpenses: boolean) => void;
}> = ({ detail, open, onClose, onConfirm }) => {
  const n = detail.savedExpenseCount;
  const expenses = `${n} expense${n === 1 ? '' : 's'}`;
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete import</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Delete {detail.fileName} and all {detail.rowCount} of its rows? This cannot be undone.
        </DialogContentText>
        {n > 0 && (
          <DialogContentText sx={{ mt: 1.5 }}>
            {expenses} saved from it {n === 1 ? 'is' : 'are'} still on the Expenses page. Keep them,
            or delete them too? If you keep them and upload this file again, those rows will show up
            for review again.
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {n > 0 ? (
          <>
            <Button onClick={() => onConfirm(true)}>Keep expenses</Button>
            <Button onClick={() => onConfirm(false)} color="error">
              Delete expenses too
            </Button>
          </>
        ) : (
          <Button onClick={() => onConfirm(false)} color="error">
            Delete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
