import { type ChangeEvent, type FC, useState } from 'react';
import { Alert, Button } from '@mui/material';
import { faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { useUploadAmazonOrdersMutation } from '../../../services/imports/importsApi';
import type { AmazonUploadResult, ImportList } from '../../../services/imports/importsApi.types';
import { formatDate } from '../../../utils';
import { goldButton } from '../formatting';
import { ErrorBox, FaIcon } from '../components';
import styles from '../ImportsPage.module.css';

// Amazon's order history, so each Amazon charge splits into the items it paid
// for, and its refund list, so a refund of one item returns just that item.
// Upload before or after the statement; either way open charges match.
export const AmazonPanel: FC<{ summary: ImportList['amazon'] }> = ({ summary }) => {
  const [upload, { isLoading, error, reset }] = useUploadAmazonOrdersMutation();
  const [results, setResults] = useState<AmazonUploadResult[]>([]);

  // One or both files; the server tells them apart by their columns.
  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = [...(input.files ?? [])];
    input.value = '';
    if (!files.length) return;
    reset();
    setResults([]);
    for (const file of files) {
      const result = await upload({ csv: await file.text() });
      if (!('data' in result) || !result.data) break;
      const data = result.data;
      setResults((prev) => [...prev, data]);
    }
  };

  const describe = (r: AmazonUploadResult) =>
    r.kind === 'orders'
      ? `${r.newItemCount} new items. ${r.matchedCount} Amazon charges split into their items.`
      : `${r.newRefundCount} new refunds. ${r.pairedCount} refunds matched to single items.`;

  return (
    <section className={styles.panel} aria-label="Upload Amazon orders">
      <div className={styles.uploadRow}>
        <Button
          component="label"
          sx={goldButton}
          startIcon={<FaIcon icon={faFileCsv} />}
          disabled={isLoading}
        >
          {isLoading ? 'Uploading…' : 'Upload Amazon orders'}
          <input
            hidden
            type="file"
            accept=".csv,text/csv"
            multiple
            aria-label="Amazon order history file"
            onChange={onFile}
          />
        </Button>
        <span className={styles.fileName}>
          {summary?.itemCount
            ? `${summary.itemCount} items${summary.latestOrderDate ? `, latest order ${formatDate(summary.latestOrderDate)}` : ''}`
            : 'No order history yet'}
          {summary?.refundCount ? ` · ${summary.refundCount} refunds` : ''}
        </span>
      </div>
      <p className={styles.hint}>
        Optional. &quot;Order History.csv&quot; from Amazon&apos;s data export (Request My Data,
        Your Orders), plus &quot;Refund Details.csv&quot; if you have it; you can choose both at
        once. Amazon charges on the statement are then split into the items they paid for, each
        saved as its own expense, and a refund of one item returns just that item. Only order ids,
        dates, product names and amounts are kept.
      </p>
      <ErrorBox error={error} />
      {results.map((r, i) => (
        <Alert key={i} severity="success" sx={{ mt: 1.5 }}>
          {describe(r)}
        </Alert>
      ))}
    </section>
  );
};
