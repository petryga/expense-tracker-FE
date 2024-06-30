import { NavLink, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { OPTIONS } from './constants';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { selectSidebar, toggleSidebar } from './sidebarSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

const Sidebar = (): JSX.Element => {
  const { isVisible } = useSelector(selectSidebar);
  const dispatch = useDispatch();
  const location = useLocation();

  return (
    <div
      className={classNames(styles.sidebar, {
        [styles.notVisible]: !isVisible,
        [styles.visible]: isVisible,
      })}
    >
      <div className={styles.toggleButton} onClick={() => dispatch(toggleSidebar())}>
        <FontAwesomeIcon
          icon={isVisible ? (faChevronLeft as IconProp) : (faChevronRight as IconProp)}
        />
      </div>
      <ul>
        {OPTIONS.map((option, i) => {
          const { text, path, subOptions } = option;
          const isActive = location.pathname.includes(path!);

          return (
            <li key={i} className={isActive ? styles.active : ''}>
              {text === 'Reports' ? (
                <div className={styles.reportsLi}>Reports</div>
              ) : (
                <NavLink to={path!}>{text}</NavLink>
              )}

              {subOptions && (
                <ul className={styles.subLinks}>
                  {subOptions.map((subOption) => {
                    const { text: subText, path: subPath } = subOption;
                    const isActiveSub = location.pathname.includes(subPath!);
                    return (
                      <li key={subPath} className={isActiveSub ? styles.active : ''}>
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
    </div>
  );
};

export default Sidebar;
