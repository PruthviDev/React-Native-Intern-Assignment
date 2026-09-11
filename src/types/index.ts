/**
 * Shared TypeScript interfaces and types for the Image Gallery App.
 * Keeps domain models (user, images, navigation, theme) in one place.
 */

/** Gender options used on Registration / Edit Profile */
export type Gender = 'Male' | 'Female' | 'Other';

/** Author-name filter used on Home gallery */
export type AuthorFilter = 'All' | 'A-M' | 'N-Z';

/** Registered / logged-in user profile */
export interface User {
  id: string;
  fullName: string;
  email: string;
  gender: Gender;
  mobile: string;
  address: string;
  city: string;
  password: string;
  /** Optional avatar key (emoji / preset id) */
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

/** Subset of User fields editable from Profile */
export type EditableUserFields = Omit<
  User,
  'id' | 'password' | 'createdAt' | 'updatedAt' | 'email'
> & {
  email: string;
  password?: string;
  confirmPassword?: string;
};

/** Picsum Photos API image item */
export interface GalleryImage {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

/** Favorited image stored locally (may include timestamp) */
export interface FavoriteImage extends GalleryImage {
  favoritedAt: string;
}

/** Theme mode for light / dark UI */
export type ThemeMode = 'light' | 'dark';

/** Persisted app session snapshot */
export interface AppSession {
  userId: string | null;
  isLoggedIn: boolean;
}

/** Form field error map */
export type FormErrors<T extends string = string> = Partial<Record<T, string>>;

/** Registration form field names */
export type RegistrationField =
  | 'fullName'
  | 'email'
  | 'gender'
  | 'mobile'
  | 'address'
  | 'city'
  | 'password'
  | 'confirmPassword';

/** Login form field names */
export type LoginField = 'email' | 'password';
