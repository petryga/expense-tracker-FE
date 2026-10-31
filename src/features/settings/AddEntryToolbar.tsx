import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GridToolbarContainer } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

const styles = {
  ':hover': {
    backgroundColor: 'var(--surface-subtle)',
    color: 'var(--text-muted)',
  },
};

export function AddEntryToolbar({ onAddButtonClick }: { onAddButtonClick: () => void }) {
  return (
    <GridToolbarContainer>
      <Button
        startIcon={<FontAwesomeIcon className="plusIcon" icon={faPlus as IconProp} />}
        onClick={onAddButtonClick}
        sx={styles}
      >
        Add entry
      </Button>
    </GridToolbarContainer>
  );
}
