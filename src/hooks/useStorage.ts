/**
 * Thin wrapper around AsyncStorage helpers for component-level use.
 * Prefer AppContext for shared state; use this for one-off reads/writes.
 */

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (!mounted) {
          return;
        }
        if (raw != null) {
          setValue(JSON.parse(raw) as T);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to read storage');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [key]);

  const save = useCallback(
    async (next: T) => {
      try {
        setValue(next);
        await AsyncStorage.setItem(key, JSON.stringify(next));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to write storage');
      }
    },
    [key],
  );

  const remove = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setValue(initialValue);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear storage');
    }
  }, [initialValue, key]);

  return { value, setValue: save, remove, loading, error };
};

export default useStorage;
