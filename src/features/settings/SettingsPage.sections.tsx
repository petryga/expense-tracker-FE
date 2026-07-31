import type { UrlTabSection } from '../../components/urlTabs/UrlTabs';
import { RecurringExpensesGrid } from './RecurringExpensesGrid';
import { RecurringIncomeGrid } from './RecurringIncomeGrid';
import { CategoriesPanel } from './CategoriesPanel';
import { AccountsPanel } from './AccountsPanel';

export const SETTINGS_SECTIONS: UrlTabSection[] = [
  { id: 'recurring-expenses', label: 'Recurring Expenses', content: <RecurringExpensesGrid /> },
  { id: 'recurring-income', label: 'Recurring Income', content: <RecurringIncomeGrid /> },
  { id: 'categories', label: 'Categories', content: <CategoriesPanel /> },
  { id: 'accounts', label: 'Accounts', content: <AccountsPanel /> },
];
