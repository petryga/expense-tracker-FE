import type { Dispatch, SetStateAction } from 'react';
import { GridActionsCellItem, GridRowModes } from '@mui/x-data-grid';
import type { GridRowId } from '@mui/x-data-grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition, IconProp } from '@fortawesome/fontawesome-svg-core';
import styles from './ExpensesPage.module.css';

/**
 * A row-actions cell item wrapping the repeated
 * `<GridActionsCellItem icon={<FontAwesomeIcon … />} … />` boilerplate that
 * every editable grid column needs.
 */
export const iconAction = ({
  icon,
  label,
  onClick,
  primary,
}: {
  icon: IconDefinition;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) => (
  <GridActionsCellItem
    icon={<FontAwesomeIcon icon={icon as IconProp} className={styles.icon} />}
    label={label}
    className={primary ? 'textPrimary' : undefined}
    onClick={onClick}
  />
);

type EditableRow = { id?: GridRowId; isNew?: boolean };

/**
 * The edit / save / cancel handlers shared by the expenses and income grids.
 * Cancel drops the row entirely when it was a not-yet-saved new row.
 */
export const createRowModeHandlers = <T extends EditableRow>({
  rowModesModel,
  setRowModesModel,
  rows,
  setRows,
}: {
  rowModesModel: Record<GridRowId, { mode: GridRowModes }>;
  setRowModesModel: (
    model: Record<GridRowId, { mode: GridRowModes; ignoreModifications?: boolean }>,
  ) => void;
  rows: T[] | undefined;
  setRows: Dispatch<SetStateAction<T[]>>;
}) => {
  const handleEditClick = (id: GridRowId) => () =>
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });

  const handleSaveClick = (id: GridRowId) => () =>
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows?.find((row) => row.id === id);
    if (editedRow?.isNew) {
      setRows(rows?.filter((row) => row.id !== id) ?? []);
    }
  };

  return { handleEditClick, handleSaveClick, handleCancelClick } as const;
};
