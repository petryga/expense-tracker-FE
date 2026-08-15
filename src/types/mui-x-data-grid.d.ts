import type { Dispatch, SetStateAction } from 'react';
import type { GridFilterModel } from '@mui/x-data-grid';
import type { EditToolbarProps } from '../features/expenses/ExpensesPage.types';

// MUI X DataGrid v7+ strictly checks slot components (slots.toolbar/footer/
// noRowsOverlay) against these override interfaces instead of loosely
// allowing any custom props through slotProps. There's one interface per
// slot for the whole app, so each field here only needs to be as strict as
// its strictest consumer (a field a component destructures as required must
// stay required here) — slotProps itself is Partial-wrapped, so no call site
// is ever forced to supply every field.
declare module '@mui/x-data-grid' {
  // Covers both EditToolbar (features/expenses, features/income) and
  // AddEntryToolbar (features/settings), the latter only needing the
  // onAddButtonClick subset. Must stay an `interface extends` (not a `type`
  // alias) since declaration merging with MUI's empty interface requires it.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ToolbarPropsOverrides extends EditToolbarProps {}

  // Only features/expenses/CustomFooter.tsx takes props; the income and
  // search CustomFooter components take none and are compatible with any
  // shape here.
  interface FooterPropsOverrides {
    setOpenConfirmationModal: Dispatch<SetStateAction<boolean>>;
    filterModel: GridFilterModel;
    setFilterModel: Dispatch<SetStateAction<GridFilterModel>>;
    hasEntries: boolean;
  }

  // yearMonth (features/expenses) is optional; hasSearched (features/search)
  // is required by its consumer.
  interface NoRowsOverlayPropsOverrides {
    yearMonth?: string;
    hasSearched: boolean;
  }
}
