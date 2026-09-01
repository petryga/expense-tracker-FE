# Expense Tracker — Web

React frontend for a personal expense & income tracker — built for myself after the budgeting app I used got discontinued.

API: **[expense-tracker-api](https://github.com/petryga/expense-tracker-BE)** · Live demo: _(link — log in as the demo user, no signup)_

## Features

- **Expenses & income** in editable MUI DataGrids — inline add/edit, multi-select delete, per-currency (CAD/USD) totals
- **Recurring** expense and income templates, managed from Settings
- **Categories & budgets** — custom categories with per-category monthly budgets
- **Accounts**
- **Reports**
  - Monthly: category breakdowns, budget vs. actual
  - All-time: a net-worth / wealth tracker, monthly-expense trend, year-over-year comparison
- **Sankey** cash-flow diagram (income → categories → spend)
- **Search** across descriptions and categories
- **CSV export** of all expenses
- Auth via Supabase; runs in a no-auth local mode when Supabase isn't configured

## Stack

| | |
|---|---|
| Framework | React 19, TypeScript, Vite |
| State / data | Redux Toolkit + **RTK Query** (one API slice per resource, with request/response normalizers) |
| UI | MUI + MUI X DataGrid, Emotion |
| Charts | Recharts, `@nivo/sankey` |
| Auth | `@supabase/supabase-js` |
| Tests | Vitest + Testing Library (jsdom) |
| CI | GitHub Actions — lint, typecheck, tests, production build |

## Architecture

```
src/
  features/          one folder per screen (expenses, income, reports/, sankey, search,
                     settings, auth) — page + columns + local helpers + tests
  services/          RTK Query API slices; each has a types file and a normalizers module
                     that maps the API shape to what the grids/charts expect
  components/        shared UI (sidebar, DataGrid wrapper, modals, tab panels)
  hooks/  utils/     cross-feature hooks and pure helpers
  store.ts           Redux store wiring every API slice + the sidebar slice
```

Routes are code-split with `React.lazy`. Auth state comes from a `Supabase` session listener in `AuthProvider`; `RequireAuth` gates the app when Supabase is configured and is a no-op when it isn't.

## Running locally

```bash
npm install
cp .env.example .env     # point VITE_API_BASE_URL at the running API; leave Supabase vars
                         # blank to run without auth
npm run dev              # http://localhost:5173
```

The API ([expense-tracker-api](https://github.com/petryga/expense-tracker-BE)) needs to be running for data to load.

## Commands

| | |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc` + production build to `dist/` |
| `npm run preview` | serve the production build |
| `npm test` | Vitest |
| `npm run lint` / `npm run typecheck` | both fail on any warning |

## Configuration

`VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — see `.env.example`.

## License

All rights reserved. Published for portfolio review; not licensed for reuse.
