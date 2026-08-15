import { type FC, useMemo, useState } from "react";
import { withSidebar } from "../../components/sidebar/withSideBar";
import { format, parseISO } from "date-fns";
import { useGetExpensesQuery } from "../../services/expenses/expensesApi";
import { ExpensesDataGrid } from "./ExpensesDataGrid";
import { getCurrentMonthPath, processExpensesData } from "./helpers";
import {
  Link as ButtonLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Button } from "@mui/material";
import classnames from "classnames";
import styles from "./ExpensesPage.module.css";

const ExpensesPage: FC = () => {
  const { data: { data: allData } = {}, isLoading } = useGetExpensesQuery(
    {},
    { refetchOnMountOrArgChange: true },
  );
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState<string | null>(currentYear);
  const location = useLocation();

  const dataByYear = useMemo(() => {
    return processExpensesData(allData);
  }, [allData]);

  if (isLoading) return <></>;

  return (
    <>
      <div className={styles.yearsContainer}>
        {Object.keys(dataByYear)
          .sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
          .map((year) => {
            const isActive = selectedYear === year;
            const isNothingSelected = selectedYear === null;

            return (
              <div key={year}>
                <Button
                  className={classnames(styles.year, {
                    [styles.inactive]: !isNothingSelected && !isActive,
                  })}
                  onClick={() =>
                    setSelectedYear((prevYear) =>
                      prevYear === year ? null : year,
                    )
                  }
                >
                  {year}
                </Button>

                {selectedYear === year &&
                  Object.keys(dataByYear[year])
                    .sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
                    .map((month) => {
                      const yearMonth = `${year}-${month}`;
                      const path = `/expenses/${yearMonth}`;
                      const isActive = location.pathname.includes(path);
                      return (
                        <ButtonLink
                          key={month}
                          to={path}
                          className={`${styles.monthLink} ${isActive ? styles.active : ""}`}
                        >
                          {format(parseISO(`${year}-${month}-01`), "MMMM")}
                        </ButtonLink>
                      );
                    })}
              </div>
            );
          })}
      </div>

      <Routes>
        <Route index element={<Navigate to={getCurrentMonthPath()} />} />
        <Route path=":yearMonth" element={<ExpensesDataGrid />} />
      </Routes>
    </>
  );
};
const ExpensesPageWithSideBar = withSidebar()(ExpensesPage);
export default ExpensesPageWithSideBar;
