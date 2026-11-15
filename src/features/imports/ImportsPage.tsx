import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { withSidebar } from '../../components/sidebar/withSideBar';
import { URLS } from '../../components/sidebar/constants';
import { useGetImportsQuery } from '../../services/imports/importsApi';
import { ImportPicker } from './ImportPicker';
import { ImportReview } from './review/ImportReview';
import { SamplePanel } from './upload/SamplePanel';
import { UploadPanel } from './upload/UploadPanel';
import styles from './ImportsPage.module.css';

// Statement import: pick an import, upload a new one (or load the demo
// sample), and review the selected one.
export const ImportsPage: FC = () => {
  const { importId } = useParams();
  const navigate = useNavigate();
  const { data: list, isLoading } = useGetImportsQuery();
  const imports = list?.data ?? [];
  const open = (id: string) => navigate(`${URLS.imports}/${id}`);

  return (
    <>
      <h1 className={styles.pageTitle}>Import Expenses</h1>
      {imports.length > 0 && (
        <ImportPicker imports={imports} selectedId={importId} onSelect={open} />
      )}
      {list?.uploadAllowed && <UploadPanel onUploaded={open} />}
      {list?.sampleAvailable && <SamplePanel onUploaded={open} />}
      {!isLoading && list && !list.uploadAllowed && !list.sampleAvailable && (
        <p className={styles.empty}>Statement import is not enabled for this account.</p>
      )}
      {importId && <ImportReview id={importId} onRemoved={() => navigate(URLS.imports)} />}
    </>
  );
};

const ImportsPageWithSidebar = withSidebar()(ImportsPage);
export default ImportsPageWithSidebar;
