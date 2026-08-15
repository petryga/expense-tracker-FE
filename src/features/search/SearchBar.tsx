import { ChangeEvent, Dispatch, useCallback, useMemo, useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import debounce from 'lodash/debounce';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import styles from './SearchPage.module.css';

export function SearchBar({
  setDebouncedValue,
}: {
  setDebouncedValue: Dispatch<React.SetStateAction<string>>;
}) {
  const [searchValue, setSearchValue] = useState('');

  // useMemo, not useCallback: we are memoising the *result* of calling
  // debounce(), not a function literal. useCallback expects an inline function
  // expression and would otherwise re-create the debounced fn on every render,
  // silently defeating the debounce.
  const debouncedSearch = useMemo(
    () => debounce((nextValue: string) => setDebouncedValue(nextValue), 500),
    [setDebouncedValue]
  );

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value } = target || {};

    if (searchValue !== value) setSearchValue(value);

    debouncedSearch(encodeURIComponent(value));
  };

  const resetSearch = useCallback(() => {
    setDebouncedValue('');
    setSearchValue('');
  }, [setDebouncedValue]);

  return (
    <>
      <TextField
        role="search"
        variant="outlined"
        value={searchValue}
        className={styles.searchBar}
        onChange={handleSearchChange}
        placeholder="Search"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <FontAwesomeIcon
                  icon={searchValue ? (faTimes as IconProp) : (faSearch as IconProp)}
                  onClick={resetSearch}
                />
              </InputAdornment>
            ),
          },
        }}
      />
    </>
  );
}
