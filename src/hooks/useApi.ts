/**
 * Generic async data-fetching hook with loading / error / refetch states.
 */

import { useCallback, useEffect, useState } from 'react';

interface UseApiOptions<T> {
  /** When false, skip the initial fetch */
  enabled?: boolean;
  /** Optional transform of the raw result */
  transform?: (data: T) => T;
}

export const useApi = <T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: UseApiOptions<T> = {},
) => {
  const { enabled = true, transform } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(transform ? transform(result) : result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (enabled) {
      execute();
    }
  }, [enabled, execute]);

  return { data, loading, error, refetch: execute, setData };
};

export default useApi;
