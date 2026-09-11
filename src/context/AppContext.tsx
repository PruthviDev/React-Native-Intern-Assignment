/**
 * AppContext – typed context shape for user, favorites, and theme state.
 * Consumers should use the useApp() hook rather than AppContext directly.
 */

import { createContext, useContext } from 'react';
import {
  FavoriteImage,
  GalleryImage,
  ThemeMode,
  User,
} from '../types';
import { AppColors } from '../theme';
import {
  LoginFormValues,
  ProfileFormValues,
  RegistrationFormValues,
} from '../utils/validation';

export interface AppContextValue {
  /** True while AsyncStorage bootstrap is in progress */
  bootstrapping: boolean;

  // Auth / user
  user: User | null;
  isLoggedIn: boolean;
  register: (values: RegistrationFormValues) => Promise<{ ok: boolean; message?: string }>;
  login: (values: LoginFormValues) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    values: ProfileFormValues & { avatar?: string },
  ) => Promise<{ ok: boolean; message?: string }>;
  setAvatar: (avatar: string) => Promise<void>;

  // Favorites
  favorites: FavoriteImage[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (image: GalleryImage) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;

  // Theme
  themeMode: ThemeMode;
  colors: AppColors;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

/** Safe accessor – throws if used outside AppProvider */
export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
