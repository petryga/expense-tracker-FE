import classnames from "classnames";
import styles from "./withSideBar.module.css";
import Sidebar from "./Sidebar";
import { selectSidebar } from "./sidebarSlice";
import { useSelector } from "react-redux";

interface ComponentProps {
  fullWidth?: boolean;
}

export const withSidebar =
  () => (PageComponent: React.ComponentType<ComponentProps>) => {
    return function WithSidePage() {
      const { isVisible: isSidebarVisible } = useSelector(selectSidebar);

      return (
        <div className={styles.root}>
          <Sidebar />
          <div
            className={classnames(styles.pageRoot, {
              [styles.compact]: isSidebarVisible,
            })}
            data-testid="page-content"
          >
            <div className={styles.centerPanel}>
              <PageComponent />
            </div>
          </div>
        </div>
      );
    };
  };
