import { FC, createContext, useContext, useMemo, useState } from 'react';
import { withSidebar } from '../../components/sidebar/withSideBar';
import { SearchBar } from './SearchBar';
import { useGetExpensesQuery } from '../../services/expenses/expensesApi';
import { tableStyles } from '../expenses/styles';
import { DataGrid } from '@mui/x-data-grid';
import { createSearchColumns } from '../expenses/searchColumns';
import type { Data } from '../../services/expenses/expensesApi.types';
import styles from './SearchPage.module.css';
import { buildCategoryTree, Currency } from '../expenses/helpers';
import { useGetCategoriesQuery } from '../../services/categories/categoriesApi';
import { useGetAccountsQuery } from '../../services/accounts/accountsApi';
import { formatAmount } from '../../utils';

const Context = createContext<{
  totalSelectedCad: number | null;
  totalSelectedUsd?: number | null;
  totalAmountSearchResultsCad?: number;
  totalAmountSearchResultsUsd?: number;
} | null>(null);

const NoRowsOverlay = ({ hasSearched }: { hasSearched: boolean }) => (
  <div className={styles.noRowsOverlay}>
    {hasSearched ? 'No results found' : 'Start typing to search'}
  </div>
);

const CustomFooter = () => {
  const {
    totalSelectedCad,
    totalSelectedUsd,
    totalAmountSearchResultsCad,
    totalAmountSearchResultsUsd,
  } = useContext(Context) || {};
  return (
    <div className={styles.footer}>
      {totalSelectedCad || totalSelectedUsd
        ? `Total Amount of Selected Entries - ${formatAmount(
            totalSelectedCad,
          )}$ (CAD) / ${formatAmount(totalSelectedUsd)}$ (USD)`
        : `Total Amount for these Results - ${formatAmount(
            totalAmountSearchResultsCad,
          )}$ (CAD) / ${formatAmount(totalAmountSearchResultsUsd)}$ (USD)`}
    </div>
  );
};

const SearchPage: FC = () => {
  const [debouncedValue, setDebouncedValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<Data[]>([]);
  const [rows, setRows] = useState<Data[]>([]);
  const {
    data: { data, expensesTotal } = {},
    isFetching,
    isLoading,
  } = useGetExpensesQuery(
    {
      search: debouncedValue,
    },
    { skip: !debouncedValue, refetchOnMountOrArgChange: true },
  );
  // Results are copied into locally-mutable row state; clearing the search box
  // empties both rows and selection. Adjusted during render instead of in an
  // effect to avoid the extra commit a sync effect would cause.
  const [syncedSearch, setSyncedSearch] = useState({ data, debouncedValue });
  if (data !== syncedSearch.data || debouncedValue !== syncedSearch.debouncedValue) {
    setSyncedSearch({ data, debouncedValue });
    if (!debouncedValue) {
      setSelectedRows([]);
      setRows([]);
    } else if (data) {
      setRows(data);
    }
  }

  // Selected-row totals are a pure function of the selection.
  const [totalCad, totalUsd] = useMemo<[number | null, number | null]>(() => {
    if (selectedRows.length === 0) return [null, null];
    return [
      selectedRows.reduce(
        (acc, row) => (row.currency === Currency.CAD ? acc + row.amount : acc),
        0,
      ),
      selectedRows.reduce(
        (acc, row) => (row.currency === Currency.USD ? acc + row.amount : acc),
        0,
      ),
    ];
  }, [selectedRows]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const { checked } = event.target;
    const selectedRow = rows.find((row) => row.id === id);

    if (checked && selectedRow) {
      setSelectedRows([...selectedRows, selectedRow]);
    } else {
      setSelectedRows(selectedRows.filter((row) => row.id !== id));
    }
  };

  const { data: categoryRecords } = useGetCategoriesQuery({});
  const categories = useMemo(() => buildCategoryTree(categoryRecords ?? []), [categoryRecords]);
  const { data: accounts } = useGetAccountsQuery({});

  const columns = createSearchColumns({
    handleCheckboxChange,
    categories,
    accounts: accounts ?? [],
  });

  return (
    <>
      <SearchBar setDebouncedValue={setDebouncedValue} />
      <Context.Provider
        value={{
          totalSelectedCad: totalCad,
          totalSelectedUsd: totalUsd,
          totalAmountSearchResultsCad: expensesTotal?.totalAmountSearchResultsCad,
          totalAmountSearchResultsUsd: expensesTotal?.totalAmountSearchResultsUsd,
        }}
      >
        <DataGrid
          autoHeight
          rows={rows || []}
          loading={isFetching || isLoading}
          columns={columns}
          sx={tableStyles}
          hideFooterPagination
          hideFooterSelectedRowCount
          slots={{
            footer: CustomFooter,
            noRowsOverlay: NoRowsOverlay,
          }}
          slotProps={{
            noRowsOverlay: { hasSearched: Boolean(debouncedValue) } as object,
          }}
        />
      </Context.Provider>
    </>
  );
};

const SearchPageWithSidebar = withSidebar()(SearchPage);
export default SearchPageWithSidebar;
