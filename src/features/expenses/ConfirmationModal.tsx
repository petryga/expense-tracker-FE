import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Dispatch } from 'react';
import styles from './ExpensesPage.module.css';

function ConfirmationModal({
  open,
  setOpen,
  onConfirm,
}: {
  open: boolean;
  setOpen: Dispatch<React.SetStateAction<boolean>>;
  onConfirm: () => void;
}) {
  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle className={styles.title}> Confirm Export</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to export all expenses?</DialogContentText>
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleDelete} color="error">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationModal;
