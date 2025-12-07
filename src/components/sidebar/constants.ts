export const URLS: Record<string, string> = {
  expenses: "/expenses",
  income: "/income",
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
    path: URLS.income,
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
        // TODO: Monarch money has this Sankey diagram to visualize the income and expenses. I would like to build something like that.
        // I don't track my income per se but in the assets section I track the total amount of money I have in my bank account every month. the difference between month to month is my income.
        // Account for bank accounts and cash fields only in the assets section.
        text: "Sankey",
        path: URLS.sankey,
      },
    ],
  },
  {
    text: "Search",
    path: URLS.search,
  },
];
