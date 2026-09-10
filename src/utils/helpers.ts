/**
 * Generic helper utilities for IDs, filtering, thumbnails, and formatting.
 */

import { AuthorFilter, GalleryImage } from '../types';

/** Generate a simple unique id */
export const generateId = (): string =>
  `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

/** Case-insensitive author/id search */
export const matchesSearch = (
  image: GalleryImage,
  query: string,
): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return (
    image.author.toLowerCase().includes(q) ||
    image.id.toLowerCase().includes(q)
  );
};

/** Filter images by author name first letter range */
export const matchesAuthorFilter = (
  image: GalleryImage,
  filter: AuthorFilter,
): boolean => {
  if (filter === 'All') {
    return true;
  }
  const first = image.author.trim().charAt(0).toUpperCase();
  if (!first || !/[A-Z]/.test(first)) {
    return filter === 'A-M'; // non-alpha authors fall into A-M bucket
  }
  if (filter === 'A-M') {
    return first >= 'A' && first <= 'M';
  }
  return first >= 'N' && first <= 'Z';
};

/** Apply search + author filter together */
export const filterImages = (
  images: GalleryImage[],
  search: string,
  filter: AuthorFilter,
): GalleryImage[] =>
  images.filter(
    image => matchesSearch(image, search) && matchesAuthorFilter(image, filter),
  );

/**
 * Build a smaller Picsum thumbnail URL from download_url.
 * Original: https://picsum.photos/id/{id}/{w}/{h}
 */
export const getThumbnailUrl = (
  image: GalleryImage,
  size = 300,
): string => `https://picsum.photos/id/${image.id}/${size}/${size}`;

/** Deduplicate images by id (useful when merging paginated pages) */
export const uniqueById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
};

export const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));
