/**
 * Infinite-scroll pagination hook for the Picsum gallery API.
 * Handles page tracking, refresh, append, and end-of-list detection.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchImages } from '../services/api';
import { GalleryImage } from '../types';
import { PAGE_LIMIT } from '../utils/constants';
import { uniqueById } from '../utils/helpers';

export const usePagination = (limit = PAGE_LIMIT) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Prevent overlapping load-more requests
  const fetchingRef = useRef(false);
  const hasImagesRef = useRef(false);

  useEffect(() => {
    hasImagesRef.current = images.length > 0;
  }, [images.length]);

  const loadPage = useCallback(
    async (pageToLoad: number, mode: 'replace' | 'append') => {
      if (fetchingRef.current) {
        return;
      }
      fetchingRef.current = true;

      if (mode === 'replace') {
        if (!hasImagesRef.current) {
          setLoading(true);
        }
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        // Initial load stays silent so EmptyState can show; subsequent
        // page failures surface a single global popup.
        const data = await fetchImages({
          page: pageToLoad,
          limit,
          silent: mode === 'replace' && !hasImagesRef.current,
        });

        setImages(prev =>
          mode === 'replace' ? data : uniqueById([...prev, ...data]),
        );
        setPage(pageToLoad);
        // Fewer items than limit ⇒ end of list
        setHasMore(data.length >= limit);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load images',
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        fetchingRef.current = false;
      }
    },
    [limit],
  );

  useEffect(() => {
    loadPage(1, 'replace');
  }, [loadPage]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setHasMore(true);
    await loadPage(1, 'replace');
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || loadingMore || refreshing || fetchingRef.current) {
      return;
    }
    await loadPage(page + 1, 'append');
  }, [hasMore, loading, loadingMore, page, refreshing, loadPage]);

  return {
    images,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    page,
    refresh,
    loadMore,
    setImages,
  };
};

export default usePagination;
