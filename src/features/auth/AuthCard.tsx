import { type FC, type FormEventHandler, type ReactNode } from 'react';
import { Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSackDollar } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import styles from './AuthCard.module.css';

export const AuthCard: FC<{
  title: string;
  onSubmit: FormEventHandler;
  children: ReactNode;
}> = ({ title, onSubmit, children }) => (
  <div className={styles.page}>
    <form className={styles.card} onSubmit={onSubmit}>
      <div className={styles.brand}>
        <FontAwesomeIcon className={styles.brandIcon} icon={faSackDollar as IconProp} />
        <span className={styles.brandText}>Expense Tracker</span>
      </div>

      <Typography variant="h5" component="h1" className={styles.title}>
        {title}
      </Typography>

      {children}
    </form>
  </div>
);
