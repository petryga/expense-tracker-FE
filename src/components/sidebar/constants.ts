export const URLS: Record<string, string> = {
  expenses: '/expenses',
  income: '/income',
  monthlyReports: '/monthly-reports',
  allTimeReports: '/all-time-reports',
  search: '/search',
};

export const OPTIONS = [
  {
    text: 'Expenses',
    path: URLS.expenses,
  },
  {
    text: 'Assets',
    path: URLS.income,
  },
  {
    text: 'Reports',
    subOptions: [
      {
        text: 'Monthly',
        path: URLS.monthlyReports,
      },
      {
        text: 'All Time',
        path: URLS.allTimeReports,
      },
    ],
  },
  {
    text: 'Search',
    path: URLS.search,
  },
];
