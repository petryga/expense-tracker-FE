import { useSearchParams } from 'react-router-dom';

export const TAB_PARAM_KEY = 'tab';

// Shared between UrlTabs (which needs it to pick what to render) and any
// page that needs to know the active tab for its own chrome (e.g. hiding a
// control that only applies to some tabs) without re-deriving the same
// default/fallback logic twice.
export const useActiveTabId = (sectionIds: string[]): string => {
  const [searchParams] = useSearchParams();
  const requestedId = searchParams.get(TAB_PARAM_KEY);
  return requestedId && sectionIds.includes(requestedId) ? requestedId : sectionIds[0];
};
