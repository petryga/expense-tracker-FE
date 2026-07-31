import { describe, expect, it } from 'vitest';
import { isValidElement, type ReactElement } from 'react';
import { buildAllTimeReportSections } from './AllTimeReportsPage.sections';
import { MonthlyExpenses } from './MonthlyExpenses';
import { WealthTracker } from './WealthTracker';
import { YearlyComparison } from './YearlyComparison';
import type { MonthlyData } from '../../../services/monthlyData/monthlyData.types';

const DATA = [{ year: 2026, month: 7 }] as unknown as MonthlyData[];

type ChartProps = { data?: MonthlyData[]; monthRange?: number | null };

const asChartElement = (content: unknown): ReactElement<ChartProps> => {
  if (!isValidElement(content)) throw new Error('Section has no content');
  return content as ReactElement<ChartProps>;
};

// Guards the mapping itself, not rendering - each section's `content` is
// just a React element descriptor (`{ type, props }`) until something
// actually renders it, so this doesn't need jsdom or component rendering to
// catch a swapped/duplicated/missing section or a dropped prop.
describe('buildAllTimeReportSections', () => {
  it('has exactly the expected section labels, in order', () => {
    const sections = buildAllTimeReportSections(DATA, 12);
    expect(sections.map((section) => section.label)).toEqual([
      'Monthly Expenses',
      'Monthly Wealth',
      'Yearly Comparison',
    ]);
  });

  it('has a unique id per section', () => {
    const ids = buildAllTimeReportSections(DATA, 12).map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('maps each label to its own distinct component, not a mismatched one', () => {
    const sections = buildAllTimeReportSections(DATA, 12);
    const byLabel = new Map(
      sections.map((section) => [section.label, asChartElement(section.content)])
    );

    expect(byLabel.get('Monthly Expenses')!.type).toBe(MonthlyExpenses);
    expect(byLabel.get('Monthly Wealth')!.type).toBe(WealthTracker);
    expect(byLabel.get('Yearly Comparison')!.type).toBe(YearlyComparison);
  });

  it('passes data and monthRange through to Monthly Expenses and Monthly Wealth', () => {
    const sections = buildAllTimeReportSections(DATA, 6);
    const byLabel = new Map(
      sections.map((section) => [section.label, asChartElement(section.content)])
    );

    expect(byLabel.get('Monthly Expenses')!.props).toEqual({ data: DATA, monthRange: 6 });
    expect(byLabel.get('Monthly Wealth')!.props).toEqual({ data: DATA, monthRange: 6 });
  });

  it("does not pass monthRange to Yearly Comparison - it doesn't accept one", () => {
    const sections = buildAllTimeReportSections(DATA, 6);
    const yearlyComparison = asChartElement(
      sections.find((section) => section.label === 'Yearly Comparison')!.content
    );

    expect(yearlyComparison.props).toEqual({ data: DATA });
  });
});
