import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GridRowModes, GridToolbarContainer } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { v4 as uuidv4 } from "uuid";
import { EditToolbarProps } from "../features/expenses/ExpensesPage.types";
import { faCircleExclamation, faPlus } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { format, getDate, parseISO } from "date-fns";
import { Data } from "../services/expenses/expensesApi.types";
import { Currency } from "../features/expenses/helpers";
import toolbarStyles from "./EditToolBar.module.css";

const styles = {
  ":hover": {
    backgroundColor: "#fff",
    color: "#727272",
  },
};

export function EditToolbar({
  setRows,
  setRowModesModel,
  onAddButtonClick,
  onAddRecurringButtonClick,
  filterModel,
  recurringDisabled,
  accounts,
}: EditToolbarProps) {
  const handleAddEntry = () => {
    if (onAddButtonClick) {
      return onAddButtonClick();
    }

    const id = uuidv4();

    setRows((oldRows) => {
      const today = new Date();
      let datePosted = format(today, "yyyy-MM-dd");

      if (oldRows.length > 0 && oldRows[0].datePosted) {
        const firstRowDate = parseISO(oldRows[0].datePosted);

        datePosted = format(
          new Date(
            firstRowDate.getFullYear(),
            firstRowDate.getMonth(),
            getDate(today)
          ),
          "yyyy-MM-dd"
        );
      }

      const defaultAccount = accounts[0];

      const newRow: Data = {
        id,
        datePosted,
        account: defaultAccount?.name ?? "",
        description: "",
        category: "",
        amount: 0,
        isNew: true,
        currency: defaultAccount?.currency ?? Currency.USD,
      };

      return [newRow, ...oldRows];
    });

    setRowModesModel((oldModel) => {
      return {
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, fieldToFocus: "datePosted" },
      };
    });
  };

  const handleAddRecurring = () => {
    if (onAddRecurringButtonClick) {
      return onAddRecurringButtonClick();
    }
  };
  const buttonDisabled = filterModel?.items.length > 0 || false;

  return (
    <GridToolbarContainer style={{ justifyContent: "space-between" }}>
      <div className={toolbarStyles.recurringGroup}>
        <Button
          startIcon={
            <FontAwesomeIcon className="plusIcon" icon={faPlus as IconProp} />
          }
          onClick={handleAddRecurring}
          sx={styles}
          disabled={buttonDisabled || recurringDisabled}
        >
          Add recurring
        </Button>

        {recurringDisabled && (
          <Tooltip title="Set your recurring entries in Settings first">
            <FontAwesomeIcon
              icon={faCircleExclamation as IconProp}
              className={toolbarStyles.warningIcon}
            />
          </Tooltip>
        )}
      </div>

      <Button
        startIcon={
          <FontAwesomeIcon className="plusIcon" icon={faPlus as IconProp} />
        }
        onClick={handleAddEntry}
        sx={styles}
        disabled={buttonDisabled}
      >
        Add entry
      </Button>
    </GridToolbarContainer>
  );
}
