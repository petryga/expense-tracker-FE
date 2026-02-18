import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export const URLS: Record<string, string> = {
  expenses: "/expenses",
  assets: "/assets",
  monthlyReports: "/monthly-reports",
  allTimeReports: "/all-time-reports",
  sankey: "/sankey",
  search: "/search",
};

export const OPTIONS = [
  {
    text: "Expenses",
    path: URLS.expenses,
  },
  {
    text: "Assets",
    path: URLS.assets,
  },
  {
    text: "Reports",
    subOptions: [
      {
        text: "Monthly",
        path: URLS.monthlyReports,
      },
      {
        text: "All Time",
        path: URLS.allTimeReports,
      },
      {
        text: "Sankey",
        path: URLS.sankey,
      },
    ],
  },
  {
    text: "Search",
    path: URLS.search,
    icon: faMagnifyingGlass,
    className: "searchOption",
  },
];
