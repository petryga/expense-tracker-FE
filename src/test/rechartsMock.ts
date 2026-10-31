import { createElement, Fragment, type ReactNode } from 'react';

// Recharts sizes itself from the DOM, which jsdom cannot do. This keeps what the
// app logic decides - which rows a chart is handed - and drops the drawing.
// Use: vi.mock('recharts', async () => (await import('../../test/rechartsMock')).rechartsMock)
type Row = Record<string, unknown>;

const Passthrough = ({ children }: { children?: ReactNode }) =>
  createElement(Fragment, null, children);
const Nothing = () => null;

const DataList = ({ data = [] }: { data?: Row[] }) =>
  createElement(
    'ul',
    { 'data-testid': 'chart-data' },
    data.map((row, index) =>
      createElement(
        'li',
        { key: index },
        Object.entries(row)
          .filter(([, value]) => typeof value === 'string' || typeof value === 'number')
          .map(([key, value]) => `${key}=${value}`)
          .join(' '),
      ),
    ),
  );

export const rechartsMock = {
  ResponsiveContainer: Passthrough,
  LineChart: DataList,
  BarChart: DataList,
  Line: Nothing,
  Bar: Nothing,
  Cell: Nothing,
  LabelList: Nothing,
  XAxis: Nothing,
  YAxis: Nothing,
  CartesianGrid: Nothing,
  Tooltip: Nothing,
  Legend: Nothing,
};
