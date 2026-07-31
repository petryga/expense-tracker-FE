import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TAB_PARAM_KEY, useActiveTabId } from './useActiveTabId';
import styles from './UrlTabs.module.css';

export interface UrlTabSection {
  id: string;
  label: string;
  content: ReactNode;
}

// Replaces MUI Tabs: which tab is active used to live in component state,
// so refreshing the page always dumped you back on the first tab. Reading
// it from the URL instead means a refresh (or a shared link) lands on the
// same tab, with no state to lose.
export const UrlTabs: FC<{ sections: UrlTabSection[]; belowNav?: ReactNode }> = ({
  sections,
  belowNav,
}) => {
  const activeId = useActiveTabId(sections.map((section) => section.id));
  const activeSection = sections.find((section) => section.id === activeId) ?? sections[0];

  return (
    <div className={styles.wrapper}>
      <nav className={styles.tabBar} aria-label="Sections">
        {sections.map((section) => {
          const isActive = section.id === activeSection.id;
          return (
            <Link
              key={section.id}
              to={`?${TAB_PARAM_KEY}=${section.id}`}
              className={isActive ? `${styles.tabLink} ${styles.tabLinkActive}` : styles.tabLink}
              aria-current={isActive ? 'page' : undefined}
            >
              {section.label}
            </Link>
          );
        })}
      </nav>

      {belowNav}

      <section aria-label={activeSection.label}>{activeSection.content}</section>
    </div>
  );
};
