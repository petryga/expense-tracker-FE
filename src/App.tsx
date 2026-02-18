import { lazy } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { URLS } from "./components/sidebar/constants";

const MonthlyReportsPage = lazy(
  () => import("./features/reports/monthly/MonthlyReportsPage"),
);
const SearchPage = lazy(() => import("./features/search/SearchPage"));
const ExpensesPage = lazy(() => import("./features/expenses/ExpensesPage"));
const AssetsPage = lazy(() => import("./features/income/AssetsPage"));
const AllTimeReportsPage = lazy(
  () => import("./features/reports/allTime/ReportsPageTabs"),
);
const SankeyPage = lazy(() => import("./features/sankey/SankeyPage"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/expenses" />} />
      <Route path="/expenses/*" element={<ExpensesPage />} />
      <Route path={URLS.assets} element={<AssetsPage />} />
      <Route path={URLS.monthlyReports} element={<MonthlyReportsPage />} />
      <Route path={URLS.allTimeReports} element={<AllTimeReportsPage />} />
      <Route path={URLS.search} element={<SearchPage />} />
      <Route path={URLS.sankey} element={<SankeyPage />} />
    </Routes>
  );
}

export default App;
