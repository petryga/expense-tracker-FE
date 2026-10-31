import { GridColDef, GridRowId, GridRowModes } from '@mui/x-data-grid';
import { faTrash, faSave, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GridActionsCellItem } from '@mui/x-data-grid';
import styles from '../expenses/ExpensesPage.module.css';
import { Currency } from '../expenses/helpers';
import { IncomeCategories, INCOME_CATEGORY_LABELS } from '../income/helpers';
import { renderEditCell } from '../../components/amountTableCell/AmountTableCell';
import { RecurringIncomeTableColumns } from './SettingsPage.types';
import { formatAmount } from '../../utils';

export function createRecurringIncomeColumns({
  rowModesModel,
  setRowModesModel,
  rows,
  setRows,
  handleOpenModal,
}: RecurringIncomeTableColumns): GridColDef[] {
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows?.find((row) => row.id === id);
    if (editedRow?.isNew) {
      setRows(rows?.filter((row) => row.id !== id) || []);
    }
  };

  return [
    {
      field: 'category',
      headerName: 'Category',
      width: 350,
      editable: true,
      type: 'singleSelect',
      valueOptions: Object.values(IncomeCategories).map((value) => ({
        value,
        label: INCOME_CATEGORY_LABELS[value],
      })),
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 280,
      editable: true,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
      type: 'string',
      editable: true,
      renderCell: (params) => `$${formatAmount(params.value)}`,
      renderEditCell,
    },
    {
      field: 'currency',
      headerName: 'Cur',
      width: 100,
      type: 'singleSelect',
      valueOptions: [Currency.CAD, Currency.USD],
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 100,
      getActions: (params) => {
        const { id } = params.row;
        const isInEditMode = rowModesModel[id]?.mode === 'edit';

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<FontAwesomeIcon icon={faSave as IconProp} className={styles.icon} />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<FontAwesomeIcon icon={faTimes as IconProp} className={styles.icon} />}
              label="Cancel"
              onClick={handleCancelClick(id)}
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<FontAwesomeIcon icon={faEdit as IconProp} className={styles.icon} />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
          />,
          <GridActionsCellItem
            icon={<FontAwesomeIcon icon={faTrash as IconProp} className={styles.icon} />}
            label="Delete"
            className="textPrimary"
            onClick={handleOpenModal(id)}
          />,
        ];
      },
    },
  ];
}
