import {
  faReceipt,
  faWallet,
  faChartPie,
  faGear,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

export const URLS: Record<string, string> = {
  expenses: "/expenses",
  assets: "/assets",
  monthlyReports: "/monthly-reports",
  allTimeReports: "/all-time-reports",
  sankey: "/sankey",
  search: "/search",
  settings: "/settings",
};

export const OPTIONS = [
  {
    text: "Expenses",
    path: URLS.expenses,
    icon: faReceipt,
  },
  {
    text: "Assets",
    path: URLS.assets,
    icon: faWallet,
  },
  {
    text: "Reports",
    icon: faChartPie,
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
    className: "pushToBottom bottomFontItem",
  },
  {
    text: "Settings",
    path: URLS.settings,
    icon: faGear,
    className: "bottomFontItem",
  },
];
