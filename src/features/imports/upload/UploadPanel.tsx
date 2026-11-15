import { type ChangeEvent, type FC, useState } from 'react';
import { Alert, Button } from '@mui/material';
import { faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { useGetAccountsQuery } from '../../../services/accounts/accountsApi';
import { useUploadStatementMutation } from '../../../services/imports/importsApi';
import { ErrorBox, FaIcon } from '../components';
import { goldButton } from '../formatting';
import styles from '../ImportsPage.module.css';

// Choosing a file uploads it straight away.
export const UploadPanel: FC<{ onUploaded: (id: string) => void }> = ({ onUploaded }) => {
  const { data: accounts = [] } = useGetAccountsQuery({});
  const [fileName, setFileName] = useState<string | null>(null);
  const [upload, { isLoading, error, reset, data: uploaded }] = useUploadStatementMutation();
  // Amex is both a CAD and a USD account in this app's history; the file
  // doesn't say which, so it is picked here, before choosing the file.
  const [currency, setCurrency] = useState<'CAD' | 'USD'>('USD');
  const account = accounts.find((a) => a.name === 'Amex')?.name ?? 'Amex';

  // Choosing a file uploads it straight away.
  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    // Cleared so picking the same file again still fires a change.
    input.value = '';
    if (!file) return;
    reset();
    setFileName(file.name);
    const result = await upload({ fileName: file.name, csv: await file.text(), account, currency });
    if ('data' in result && result.data?.id) onUploaded(result.data.id);
  };

  return (
    <section className={styles.panel} aria-label="Upload a statement">
      <div className={styles.uploadRow}>
        <Button
          component="label"
          sx={goldButton}
          startIcon={<FaIcon icon={faFileCsv} />}
          disabled={isLoading}
        >
          {isLoading ? 'Uploading…' : 'Upload Amex CSV'}
          <input
            hidden
            type="file"
            accept=".csv,text/csv"
            aria-label="Statement file"
            onChange={onFile}
          />
        </Button>
        <span className={styles.fileName}>{fileName ?? 'No file chosen'}</span>
        {(['USD', 'CAD'] as const).map((c) => (
          <Button
            key={c}
            size="small"
            className={`${styles.actionButton} ${currency === c ? styles.actionButtonActive : ''}`}
            onClick={() => setCurrency(c)}
            aria-pressed={currency === c}
          >
            {c}
          </Button>
        ))}
      </div>
      <p className={styles.hint}>
        Pick USD or CAD first, then choose the detailed activity export from Amex; it uploads right
        away. Nothing becomes an expense until you confirm it, and uploading an overlapping file
        again only adds the rows that are new.
      </p>
      <ErrorBox error={error} />
      {uploaded && !uploaded.id && (
        <Alert severity="info" sx={{ mt: 1.5 }}>
          All {uploaded.rowCount} rows in that file were imported before. Nothing new to review.
        </Alert>
      )}
    </section>
  );
};
