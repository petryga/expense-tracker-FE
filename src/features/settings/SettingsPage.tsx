import { FC } from 'react';
import { withSidebar } from '../../components/sidebar/withSideBar';
import { UrlTabs } from '../../components/urlTabs/UrlTabs';
import { SETTINGS_SECTIONS } from './SettingsPage.sections';

const SettingsPage: FC = () => {
  return (
    <>
      <h1>Settings</h1>
      <UrlTabs sections={SETTINGS_SECTIONS} />
    </>
  );
};

const SettingsPageWithSidebar = withSidebar()(SettingsPage);
export default SettingsPageWithSidebar;
