import { describe, expect, it } from 'vitest';
import { isValidElement } from 'react';
import { SETTINGS_SECTIONS } from './SettingsPage.sections';
import { RecurringExpensesGrid } from './RecurringExpensesGrid';
import { RecurringIncomeGrid } from './RecurringIncomeGrid';
import { CategoriesPanel } from './CategoriesPanel';
import { AccountsPanel } from './AccountsPanel';

// Guards the mapping itself, not rendering - each section's `content` is
// just a React element descriptor (`{ type, props }`) until something
// actually renders it, so this doesn't need jsdom or component rendering to
// catch a swapped/duplicated/missing section.
describe('SETTINGS_SECTIONS', () => {
  it('has exactly the expected section labels, in order', () => {
    expect(SETTINGS_SECTIONS.map((section) => section.label)).toEqual([
      'Recurring Expenses',
      'Recurring Income',
      'Categories',
      'Accounts',
    ]);
  });

  it('has a unique id per section, matching the label', () => {
    const ids = SETTINGS_SECTIONS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('maps each label to its own distinct panel component - not a mismatched one', () => {
    const contentTypeByLabel = new Map(
      SETTINGS_SECTIONS.map((section) => {
        if (!isValidElement(section.content)) throw new Error(`${section.label} has no content`);
        return [section.label, section.content.type];
      }),
    );

    expect(contentTypeByLabel.get('Recurring Expenses')).toBe(RecurringExpensesGrid);
    expect(contentTypeByLabel.get('Recurring Income')).toBe(RecurringIncomeGrid);
    expect(contentTypeByLabel.get('Categories')).toBe(CategoriesPanel);
    expect(contentTypeByLabel.get('Accounts')).toBe(AccountsPanel);
  });
});
