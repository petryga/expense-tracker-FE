import { FC, useMemo, useState } from 'react';
import { withSidebar } from '../../components/sidebar/withSideBar';
import { useGetFlowReportQuery } from '../../services/monthlyData/monthlyDataApi';
import { format, parseISO } from 'date-fns';
import { ResponsiveSankey } from '@nivo/sankey';
import { Text, type TextProps } from '@nivo/text';
import styles from './SankeyPage.module.css';
import { buildSankeyData, COLORS, sortSavingsLast, splitTrailingParenthetical } from './helpers';
import { SankeyChartLink, SankeyChartNode } from './SankeyPage.types';
import { formatAmount } from '../../utils';

// Nivo's Sankey labels are plain SVG <text> elements, which don't wrap or
// honor "\n" -- rendering the breakdown as its own line needs two stacked
// <Text> instances (each already wired up to nivo's animated positioning)
// instead of one.
function SankeyNodeLabel(props: TextProps) {
  const { children, ...rest } = props;
  const [main, bracket] = splitTrailingParenthetical(String(children ?? ''));

  if (!bracket) {
    return <Text {...props} />;
  }

  return (
    <>
      <Text {...rest} dy="-0.6em">
        {main}
      </Text>
      <Text {...rest} dy="0.7em">
        {bracket}
      </Text>
    </>
  );
}

export const SankeyPage: FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  // selectedMonth is only ever the user's own pick; until they pick one (or if
  // their pick isn't comparable) the BE answers with the latest eligible month.
  const { data: report } = useGetFlowReportQuery(selectedMonth, {
    refetchOnMountOrArgChange: true,
  });

  const { nodes, links, incomeAmount, expenseTotal, availableMonths, activeMonth } = useMemo(
    () => buildSankeyData(report),
    [report],
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Income to Expense Flow</h2>

        <div className={styles.controls}>
          <label htmlFor="month-select">Month</label>
          <select
            id="month-select"
            className={styles.select}
            value={activeMonth ?? ''}
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
          <span>Income change: ${formatAmount(incomeAmount)}</span>
          <span>Expenses: ${formatAmount(expenseTotal)}</span>
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
            sort={sortSavingsLast}
            label={(node) => node.name}
            labelPosition="outside"
            labelPadding={10}
            labelTextColor="#0f172a"
            labelComponent={SankeyNodeLabel}
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
