import type { FC } from 'react';
import { Alert, Button } from '@mui/material';
import { faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useImportSampleStatementMutation } from '../../../services/imports/importsApi';
import { ErrorBox, FaIcon } from '../components';
import { goldButton } from '../formatting';
import styles from '../ImportsPage.module.css';

const AI_REPO_URL = 'https://github.com/petryga/expense-tracker-AI';

// The public demo account can't upload files; it loads a bundled synthetic one.
export const SamplePanel: FC<{ onUploaded: (id: string) => void }> = ({ onUploaded }) => {
  const [importSample, { isLoading, error, data }] = useImportSampleStatementMutation();
  return (
    <section className={styles.panel} aria-label="Sample statement">
      <div className={styles.uploadRow}>
        <span className={styles.fileName}>
          A made-up Amex statement: a card payment and a reward get skipped, a refund cancels its
          purchase from the month before, and a partial refund is left for you to decide.
        </span>
        <Button
          sx={goldButton}
          startIcon={<FaIcon icon={faFileArrowUp} />}
          disabled={isLoading}
          onClick={async () => {
            const result = await importSample();
            if ('data' in result && result.data?.id) onUploaded(result.data.id);
          }}
        >
          Import sample statement
        </Button>
      </div>
      <p className={styles.hint}>
        In this demo the AI category suggestions were made in advance with Claude, so no model is
        called here, and the spending assistant runs only locally. Code and eval results:{' '}
        <a href={AI_REPO_URL} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        .
      </p>
      <ErrorBox error={error} />
      {data && !data.id && (
        <Alert severity="info" sx={{ mt: 1.5 }}>
          The sample is already imported. Open it above.
        </Alert>
      )}
    </section>
  );
};
