import { GridColDef, GridRowId, GridRowModes } from '@mui/x-data-grid';
import { faTrash, faSave, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GridActionsCellItem } from '@mui/x-data-grid';
import styles from '../expenses/ExpensesPage.module.css';
import { Currency } from '../expenses/helpers';
import { formatAmount, transformCategoriesForDropdown } from '../../utils';
import { renderEditCell } from '../../components/amountTableCell/AmountTableCell';
import { RecurringExpenseTableColumns } from './SettingsPage.types';

export function createRecurringExpenseColumns({
  rowModesModel,
  setRowModesModel,
  rows,
  setRows,
  handleOpenModal,
  categories,
  accounts,
}: RecurringExpenseTableColumns): GridColDef[] {
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
      field: 'account',
      headerName: 'Account',
      width: 130,
      type: 'singleSelect',
      valueOptions: accounts.map((account) => account.name),
      editable: true,
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 280,
      editable: true,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 300,
      type: 'singleSelect',
      valueOptions: transformCategoriesForDropdown(categories),
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
      width: 90,
      type: 'singleSelect',
      valueOptions: [Currency.CAD, Currency.USD],
      editable: true,
    },
    {
      field: 'dayOfMonth',
      headerName: 'Day of Month',
      width: 120,
      type: 'number',
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
