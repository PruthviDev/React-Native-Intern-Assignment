/**
 * App-wide constants: storage keys, cities, avatars, API config.
 */

export const STORAGE_KEYS = {
  USERS: '@ImageGallery/users',
  SESSION: '@ImageGallery/session',
  FAVORITES: '@ImageGallery/favorites',
  THEME: '@ImageGallery/theme',
} as const;

export const API_BASE_URL = 'https://picsum.photos/v2/list';
/** Matches assignment API example; used for infinite-scroll page size */
export const PAGE_LIMIT = 50;
/** Default HTTP timeout for gallery requests */
export const REQUEST_TIMEOUT_MS = 15000;

/** Cities shown in the Registration / Edit Profile dropdown */
export const CITIES = [
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Kochi',
  'Indore',
  'Bhopal',
  'Other',
] as const;

/** Preset avatar emojis for bonus avatar selection */
export const AVATARS = [
  '👤',
  '👨',
  '👩',
  '🧑',
  '👨‍💻',
  '👩‍💻',
  '🧔',
  '👩‍🦰',
  '🦸',
  '🧙',
  '🐱',
  '🐶',
] as const;

export const GENDERS = ['Male', 'Female', 'Other'] as const;

export const AUTHOR_FILTERS = ['All', 'A-M', 'N-Z'] as const;
