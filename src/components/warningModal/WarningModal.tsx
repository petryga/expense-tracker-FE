import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Dispatch } from 'react';
import styles from './WarningModal.module.css';

function WarningModal({
  open,
  setOpen,
  onDelete,
}: {
  open: boolean;
  setOpen: Dispatch<React.SetStateAction<boolean>>;
  onDelete: () => void;
}) {
  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle className={styles.title}> Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this entry? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleDelete} color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WarningModal;
