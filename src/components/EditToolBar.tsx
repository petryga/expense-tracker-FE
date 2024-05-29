import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GridRowModes, GridToolbarContainer } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import { v4 as uuidv4 } from 'uuid';
import { EditToolbarProps } from '../features/expenses/ExpensesPage.types';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { format, getDate, parseISO } from 'date-fns';

const styles = {
  ':hover': {
    backgroundColor: '#fff',
    color: '#727272',
  },
};

export function EditToolbar({
  setRows,
  setRowModesModel,
  onAddButtonClick,
  onAddRecurringButtonClick,
}: EditToolbarProps) {
  const handleAddEntry = () => {
    if (onAddButtonClick) {
      return onAddButtonClick();
    }

    const id = uuidv4();

    setRows((oldRows) => {
      const today = new Date();
      let datePosted = format(today, 'yyyy-MM-dd');

      if (oldRows.length > 0 && oldRows[0].datePosted) {
        const firstRowDate = parseISO(oldRows[0].datePosted);

        datePosted = format(
          new Date(firstRowDate.getFullYear(), firstRowDate.getMonth(), getDate(today)),
          'yyyy-MM-dd'
        );
      }

      const newRow = {
        id,
        datePosted,
        account: '',
        description: '',
        category: '',
        amount: 0,
        isNew: true,
      };

      return [newRow, ...oldRows];
    });

    setRowModesModel((oldModel) => {
      return {
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, fieldToFocus: 'datePosted' },
      };
    });
  };

  const handleAddRecurring = () => {
    if (onAddRecurringButtonClick) {
      return onAddRecurringButtonClick();
    }
  };

  return (
    <GridToolbarContainer style={{ justifyContent: 'space-between' }}>
      <Button
        startIcon={<FontAwesomeIcon className="plusIcon" icon={faPlus as IconProp} />}
        onClick={handleAddEntry}
        sx={styles}
      >
        Add entry
      </Button>

      <Button
        startIcon={<FontAwesomeIcon className="plusIcon" icon={faPlus as IconProp} />}
        onClick={handleAddRecurring}
        sx={styles}
      >
        Add recurring
      </Button>
    </GridToolbarContainer>
  );
}
