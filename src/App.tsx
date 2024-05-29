import { lazy } from 'react';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { URLS } from './components/sidebar/constants';

const MonthlyReportsPage = lazy(() => import('./features/reports/monthly/MonthlyReportsPage'));
const SearchPage = lazy(() => import('./features/search/SearchPage'));
const ExpensesPage = lazy(() => import('./features/expenses/ExpensesPage'));
const IncomePage = lazy(() => import('./features/income/IncomePage'));
const AllTimeReportsPage = lazy(() => import('./features/reports/allTime/AllTimeReportsPage'));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/expenses" />} />
      <Route path="/expenses/*" element={<ExpensesPage />} />
      <Route path={URLS.income} element={<IncomePage />} />
      <Route path={URLS.monthlyReports} element={<MonthlyReportsPage />} />
      <Route path={URLS.allTimeReports} element={<AllTimeReportsPage />} />
      <Route path={URLS.search} element={<SearchPage />} />
    </Routes>
  );
}

export default App;
