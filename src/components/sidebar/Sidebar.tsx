import type { JSX } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { OPTIONS } from "./constants";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { selectSidebar, toggleSidebar } from "./sidebarSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faSackDollar,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { isAuthEnabled, supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../features/auth/useAuth";

const Sidebar = (): JSX.Element => {
  const { isVisible } = useSelector(selectSidebar);
  const { session } = useAuth();

  const dispatch = useDispatch();
  const location = useLocation();

  return (
    <div
      className={classNames(styles.sidebar, {
        [styles.notVisible]: !isVisible,
        [styles.visible]: isVisible,
      })}
    >
      <div
        className={styles.toggleButton}
        onClick={() => dispatch(toggleSidebar())}
      >
        <FontAwesomeIcon
          icon={
            isVisible
              ? (faChevronLeft as IconProp)
              : (faChevronRight as IconProp)
          }
        />
      </div>
      <div className={styles.brand}>
        <FontAwesomeIcon
          className={styles.brandIcon}
          icon={faSackDollar as IconProp}
        />
        <span className={styles.brandText}>Expense Tracker</span>
      </div>
      <ul>
        {OPTIONS.map((option, i) => {
          const { text, path, subOptions, icon, className = "" } = option;
          const optionClassNames = className
            .split(" ")
            .filter(Boolean)
            .map((c) => styles[c as keyof typeof styles]);
          const isActive = location.pathname.includes(path!);

          return (
            <li
              key={i}
              className={classNames(...optionClassNames, isActive ? styles.active : "")}
            >
              {text === "Reports" ? (
                <div className={styles.reportsLi}>
                  {icon && (
                    <FontAwesomeIcon
                      className={styles.sectionIcon}
                      icon={icon as IconProp}
                    />
                  )}
                  Reports
                </div>
              ) : (
                <NavLink to={path!}>
                  {icon && (
                    <FontAwesomeIcon
                      className={styles.sidebarIcon}
                      icon={icon as IconProp}
                    />
                  )}
                  {text}
                </NavLink>
              )}

              {subOptions && (
                <ul className={styles.subLinks}>
                  {subOptions.map((subOption) => {
                    const { text: subText, path: subPath } = subOption;
                    const isActiveSub = location.pathname.includes(subPath!);
                    return (
                      <li
                        key={subPath}
                        className={isActiveSub ? styles.active : ""}
                      >
                        <NavLink to={subPath}>{subText}</NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      {isAuthEnabled && session?.user?.email && (
        <div className={styles.userEmail} title={session.user.email}>
          {session.user.email}
        </div>
      )}
      {isAuthEnabled && (
        <button
          type="button"
          className={styles.logoutButton}
          onClick={() => supabase?.auth.signOut()}
        >
          <FontAwesomeIcon
            className={styles.sidebarIcon}
            icon={faRightFromBracket as IconProp}
          />
          Log out
        </button>
      )}
    </div>
  );
};

export default Sidebar;
