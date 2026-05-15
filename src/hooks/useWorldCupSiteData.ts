import { useEffect, useState } from 'react';
import {
  fallbackWorldCupSiteData,
  loadRuntimeWorldCupSiteData,
  type WorldCupSiteData
} from '../data/siteData';

export function useWorldCupSiteData() {
  const [siteData, setSiteData] = useState<WorldCupSiteData>(fallbackWorldCupSiteData);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    if (import.meta.env.MODE === 'test') return;
    if (typeof fetch !== 'function') return;

    const controller = new AbortController();

    loadRuntimeWorldCupSiteData(controller.signal)
      .then((runtimeData) => {
        if (!controller.signal.aborted) {
          setSiteData(runtimeData);
          setRuntimeError(null);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setRuntimeError(error instanceof Error ? error.message : 'Failed to load runtime World Cup data');
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  return { siteData, runtimeError };
}
