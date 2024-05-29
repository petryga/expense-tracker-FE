import { FC, createContext, useContext, useEffect, useState } from 'react';
import { withSidebar } from '../../components/sidebar/withSideBar';
import { SearchBar } from './SearchBar';
import { useGetExpensesQuery } from '../../services/expenses/expensesApi';
import { tableStyles } from '../expenses/styles';
import { DataGrid } from '@mui/x-data-grid';
import { createSearchColumns } from '../expenses/columns';
import type { Data } from '../../services/expenses/expensesApi.types';

import styles from './SearchPage.module.css';

const Context = createContext<{
  totalSelected: number | null;
  totalAmountSearchResults?: number;
} | null>(null);

const CustomFooter = () => {
  const { totalSelected, totalAmountSearchResults } = useContext(Context) || {};
  return (
    <div className={styles.footer}>
      {totalSelected
        ? `Total Amount of Selected Entries - ${totalSelected?.toFixed(2)}$`
        : `Total Amount for these Results - ${totalAmountSearchResults}$`}
    </div>
  );
};

const SearchPage: FC = () => {
  const [debouncedValue, setDebouncedValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<Data[]>([]);
  const [total, setTotal] = useState<number | null>(null);
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
      const total = selectedRows.reduce((acc, row) => acc + row.amount, 0);
      setTotal(total);
    } else {
      setTotal(null);
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

  const columns = createSearchColumns({
    handleCheckboxChange,
  });

  return (
    <>
      <SearchBar setDebouncedValue={setDebouncedValue} />
      {(isFetching || isLoading) && <div>Loading...</div>}
      <Context.Provider
        value={{
          totalSelected: total,
          totalAmountSearchResults: expensesTotal?.totalAmountSearchResults,
        }}
      >
        <DataGrid
          autoHeight
          rows={rows || []}
          columns={columns}
          sx={tableStyles}
          hideFooterPagination
          hideFooterSelectedRowCount
          slots={{
            footer: CustomFooter,
          }}
        />
      </Context.Provider>
    </>
  );
};

const SearchPageWithSidebar = withSidebar()(SearchPage);
export default SearchPageWithSidebar;
