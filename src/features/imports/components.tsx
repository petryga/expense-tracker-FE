import type { FC } from 'react';
import { Alert } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { money } from './formatting';
import styles from './ImportsPage.module.css';

export const FaIcon: FC<{ icon: unknown }> = ({ icon }) => (
  <FontAwesomeIcon icon={icon as IconProp} />
);

type ApiError = { data?: { error?: string; details?: { line: number; message: string }[] } };

export const ErrorBox: FC<{ error: unknown }> = ({ error }) => {
  if (!error) return null;
  const data = (error as ApiError).data;
  return (
    <Alert severity="error" sx={{ mt: 1.5, textAlign: 'left' }}>
      {data?.error ?? 'Something went wrong'}
      {!!data?.details?.length && (
        <ul className={styles.errors}>
          {data.details.slice(0, 10).map((d) => (
            <li key={`${d.line}-${d.message}`}>
              {d.line ? `Line ${d.line}: ` : ''}
              {d.message}
            </li>
          ))}
        </ul>
      )}
    </Alert>
  );
};

export const Amount: FC<{ cents: number }> = ({ cents }) => (
  <span className={cents < 0 ? styles.credit : undefined}>{money(cents)}</span>
);
