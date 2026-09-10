/**
 * Picsum Photos API service.
 * Uses a shared fetch helper with timeout + normalized network errors.
 */

import { GalleryImage } from '../types';
import { API_BASE_URL, PAGE_LIMIT, REQUEST_TIMEOUT_MS } from '../utils/constants';
import {
  AppNetworkError,
  handleNetworkError,
  messageForStatus,
} from './networkError';

export interface FetchImagesParams {
  page?: number;
  limit?: number;
  /** When true, skip global popup (Home shows EmptyState instead) */
  silent?: boolean;
}

/** fetch with AbortController timeout */
const fetchWithTimeout = async (
  url: string,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    // AbortError → timeout; other failures → network
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AppNetworkError(
        'The request timed out. Please try again.',
        'TIMEOUT',
      );
    }
    throw new AppNetworkError(
      'Unable to connect. Please check your internet connection and try again.',
      'NETWORK',
    );
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Fetch a page of images from Picsum.
 * Throws AppNetworkError with a user-friendly message on failure.
 */
export const fetchImages = async ({
  page = 1,
  limit = PAGE_LIMIT,
  silent = true,
}: FetchImagesParams = {}): Promise<GalleryImage[]> => {
  const url = `${API_BASE_URL}?page=${page}&limit=${limit}`;

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      const { code, message } = messageForStatus(response.status);
      throw new AppNetworkError(message, code, response.status);
    }

    const data = (await response.json()) as GalleryImage[];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // Initial gallery load uses silent + EmptyState; load-more can notify
    throw handleNetworkError(error, {
      silent,
      title: 'Couldn’t load images',
    });
  }
};
