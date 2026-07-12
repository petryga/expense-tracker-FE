import { FC, useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import { withSidebar } from '../../components/sidebar/withSideBar';
import { tabsStyles } from '../expenses/styles';
import { RecurringExpensesGrid } from './RecurringExpensesGrid';
import { RecurringIncomeGrid } from './RecurringIncomeGrid';
import { CategoriesPanel } from './CategoriesPanel';

const SettingsPage: FC = () => {
  const [value, setValue] = useState(0);

  return (
    <>
      <h1>Settings</h1>
      <Tabs
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        variant="fullWidth"
        sx={tabsStyles}
      >
        <Tab label="Recurring Expenses" />
        <Tab label="Recurring Income" />
        <Tab label="Categories" />
      </Tabs>

      {value === 0 && <RecurringExpensesGrid />}
      {value === 1 && <RecurringIncomeGrid />}
      {value === 2 && <CategoriesPanel />}
    </>
  );
};

const SettingsPageWithSidebar = withSidebar()(SettingsPage);
export default SettingsPageWithSidebar;
