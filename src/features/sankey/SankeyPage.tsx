import { FC, useMemo, useState } from 'react';
import { withSidebar } from '../../components/sidebar/withSideBar';
import { useGetIncomeEntriesQuery } from '../../services/income/incomeApi';
import { useGetExpensesQuery } from '../../services/expenses/expensesApi';
import { format, parseISO } from 'date-fns';
import { ResponsiveSankey } from '@nivo/sankey';
import styles from './SankeyPage.module.css';
import { buildSankeyData, COLORS } from './helpers';
import { SankeyChartLink, SankeyChartNode } from './SankeyPage.types';

const SankeyPage: FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  const { data: incomeData } = useGetIncomeEntriesQuery({});
  const { data: expensesResponse } = useGetExpensesQuery({});
  const expenses = expensesResponse?.data;

  const { nodes, links, incomeAmount, expenseTotal, availableMonths, activeMonth } = useMemo(
    () => buildSankeyData(incomeData, expenses, selectedMonth),
    [incomeData, expenses, selectedMonth],
  );

  const sankeyData = useMemo(() => {
    if (!nodes.length || !links.length) return undefined;

    const nodeColors = nodes.map((node, idx) => node.color ?? COLORS[idx % COLORS.length]);

    return {
      nodes: nodes.map((node, idx) => ({
        id: String(idx),
        name: node.name,
        color: nodeColors[idx],
      })),
      links: links.map((link) => ({
        source: String(link.source),
        target: String(link.target),
        value: link.value,
        color: link.color ?? nodeColors[link.target] ?? nodeColors[link.source] ?? '#cbd5e1',
      })),
    };
  }, [links, nodes]);

  // Both adjustments below are self-limiting -- once selectedMonth is valid the
  // condition stops matching -- so they run during render rather than in an
  // effect, which avoids the extra commit and the flash of a stale month.
  if (availableMonths.length && (!selectedMonth || !availableMonths.includes(selectedMonth))) {
    setSelectedMonth(availableMonths[availableMonths.length - 1]);
  }

  if (activeMonth && selectedMonth && activeMonth !== selectedMonth) {
    setSelectedMonth(activeMonth);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Income to Expense Flow</h2>

        <div className={styles.controls}>
          <label htmlFor="month-select">Month</label>
          <select
            id="month-select"
            className={styles.select}
            value={selectedMonth ?? ''}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {format(parseISO(`${month}-01`), 'MMM yyyy')}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.totals}>
          <span>Income change: ${incomeAmount.toFixed(2)}</span>
          <span>Expenses: ${expenseTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className={styles.chart}>
        {sankeyData ? (
          <ResponsiveSankey<SankeyChartNode, SankeyChartLink>
            data={sankeyData}
            margin={{ top: 24, right: 200, bottom: 24, left: 100 }}
            nodeThickness={18}
            nodeSpacing={20}
            nodeBorderWidth={0}
            nodeOpacity={0.95}
            linkOpacity={0.35}
            colors={{ datum: 'color' }}
            label={(node) => node.name}
            labelPosition="outside"
            labelPadding={10}
            labelTextColor="#0f172a"
            enableLinkGradient
          />
        ) : (
          <div className={styles.emptyState}>
            We need more data to render this month&apos;s income and expenses.
          </div>
        )}
      </div>
    </div>
  );
};

const SankeyPageWithSidebar = withSidebar()(SankeyPage);
export default SankeyPageWithSidebar;
