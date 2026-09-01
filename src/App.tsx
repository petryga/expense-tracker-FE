import { lazy } from 'react';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { URLS } from './components/sidebar/constants';
import { RequireAuth } from './features/auth/RequireAuth';

const MonthlyReportsPage = lazy(() => import('./features/reports/monthly/MonthlyReportsPage'));
const SearchPage = lazy(() => import('./features/search/SearchPage'));
const ExpensesPage = lazy(() => import('./features/expenses/ExpensesPage'));
const AssetsPage = lazy(() => import('./features/income/AssetsPage'));
const AllTimeReportsPage = lazy(() => import('./features/reports/allTime/AllTimeReportsPage'));
const SankeyPage = lazy(() => import('./features/sankey/SankeyPage'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const SignupPage = lazy(() => import('./features/auth/SignupPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<Navigate to="/expenses" />} />
      <Route
        path="/expenses/*"
        element={
          <RequireAuth>
            <ExpensesPage />
          </RequireAuth>
        }
      />
      <Route
        path={URLS.assets}
        element={
          <RequireAuth>
            <AssetsPage />
          </RequireAuth>
        }
      />
      <Route
        path={URLS.monthlyReports}
        element={
          <RequireAuth>
            <MonthlyReportsPage />
          </RequireAuth>
        }
      />
      <Route
        path={URLS.allTimeReports}
        element={
          <RequireAuth>
            <AllTimeReportsPage />
          </RequireAuth>
        }
      />
      <Route
        path={URLS.search}
        element={
          <RequireAuth>
            <SearchPage />
          </RequireAuth>
        }
      />
      <Route
        path={URLS.sankey}
        element={
          <RequireAuth>
            <SankeyPage />
          </RequireAuth>
        }
      />
      <Route
        path={URLS.settings}
        element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
