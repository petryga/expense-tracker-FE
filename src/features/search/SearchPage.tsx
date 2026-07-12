import { FC, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { withSidebar } from '../../components/sidebar/withSideBar';
import { SearchBar } from './SearchBar';
import { useGetExpensesQuery } from '../../services/expenses/expensesApi';
import { tableStyles } from '../expenses/styles';
import { DataGrid } from '@mui/x-data-grid';
import { createSearchColumns } from '../expenses/columns';
import type { Data } from '../../services/expenses/expensesApi.types';

import styles from './SearchPage.module.css';
import { buildCategoryTree, Currency } from '../expenses/helpers';
import { useGetCategoriesQuery } from '../../services/categories/categoriesApi';

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
        ? `Total Amount of Selected Entries - ${totalSelectedCad?.toFixed(
            2
          )}$ (CAD) / ${totalSelectedUsd?.toFixed(2)}$ (USD)`
        : `Total Amount for these Results - ${totalAmountSearchResultsCad}$ (CAD) / ${totalAmountSearchResultsUsd}$ (USD)`}
    </div>
  );
};

const SearchPage: FC = () => {
  const [debouncedValue, setDebouncedValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<Data[]>([]);
  const [totalCad, setTotalCad] = useState<number | null>(null);
  const [totalUsd, setTotalUsd] = useState<number | null>(null);
  const [rows, setRows] = useState<Data[]>([]);
  const {
    data: { data, expensesTotal } = {},
    isFetching,
    isLoading,
  } = useGetExpensesQuery(
    {
      search: debouncedValue,
    },
    { skip: !debouncedValue, refetchOnMountOrArgChange: true }
  );
  useEffect(() => {
    if (data) {
      setRows(data);
    }
    if (!debouncedValue) {
      setSelectedRows([]);
      setRows([]);
    }
  }, [data, debouncedValue]);

  useEffect(() => {
    if (selectedRows.length > 0) {
      const totalCad = selectedRows.reduce(
        (acc, row) => (row.currency === Currency.CAD ? acc + row.amount : acc),
        0
      );
      const totalUsd = selectedRows.reduce(
        (acc, row) => (row.currency === Currency.USD ? acc + row.amount : acc),
        0
      );
      setTotalCad(totalCad);
      setTotalUsd(totalUsd);
    } else {
      setTotalCad(null);
      setTotalUsd(null);
    }
  }, [debouncedValue, selectedRows]);

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

  const columns = createSearchColumns({
    handleCheckboxChange,
    categories,
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
