import { useEffect, useState } from 'react';
import { usePage } from '@/hooks/pages';
import { clearCacheForEndpoint } from './db';

export function usePageStore() {
  const { currentPage } = usePage();
  const [shouldRefetch, setShouldRefetch] = useState(false);

  // Trigger re-fetch when page changes
  useEffect(() => {
    if (currentPage) {
      setShouldRefetch(true);
      // Reset after a short delay to allow fetch
      const timer = setTimeout(() => setShouldRefetch(false), 100);
      return () => clearTimeout(timer);
    }
  }, [currentPage?.apiEndpoint]);

  const invalidateCache = async (endpoint?: string) => {
    if (endpoint) {
      await clearCacheForEndpoint(endpoint);
    } else if (currentPage) {
      await clearCacheForEndpoint(currentPage.apiEndpoint);
    }
  };

  return {
    currentPage,
    shouldRefetch,
    invalidateCache,
  };
}
