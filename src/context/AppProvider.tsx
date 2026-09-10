/**
 * AppProvider – centralizes auth, favorites, and theme state with AsyncStorage.
 * Avoids prop drilling; all screens consume state via useApp().
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppContext, AppContextValue } from './AppContext';
import {
  FavoriteImage,
  GalleryImage,
  ThemeMode,
  User,
} from '../types';
import { darkColors, lightColors } from '../theme';
import { generateId } from '../utils/helpers';
import {
  LoginFormValues,
  ProfileFormValues,
  RegistrationFormValues,
} from '../utils/validation';
import * as storage from '../services/storage';

interface Props {
  children: React.ReactNode;
}

export const AppProvider: React.FC<Props> = ({ children }) => {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<FavoriteImage[]>([]);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  // ── Bootstrap from AsyncStorage ────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const { session, users, theme } = await storage.loadBootstrapState();
        if (!mounted) {
          return;
        }

        setThemeMode(theme);

        if (session.isLoggedIn && session.userId) {
          const current = users.find(u => u.id === session.userId) ?? null;
          setUser(current);
          if (current) {
            const favs = await storage.getFavoritesForUser(current.id);
            if (mounted) {
              setFavorites(favs);
            }
          }
        }
      } catch {
        // Soft-fail bootstrap so the app still opens on Login
      } finally {
        if (mounted) {
          setBootstrapping(false);
        }
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const register = useCallback(
    async (values: RegistrationFormValues) => {
      try {
        const existing = await storage.findUserByEmail(values.email.trim());
        if (existing) {
          return { ok: false, message: 'An account with this email already exists' };
        }

        const now = new Date().toISOString();
        const newUser: User = {
          id: generateId(),
          fullName: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          gender: values.gender as User['gender'],
          mobile: values.mobile.trim(),
          address: values.address.trim(),
          city: values.city,
          password: values.password,
          avatar: '👤',
          createdAt: now,
          updatedAt: now,
        };

        await storage.upsertUser(newUser);
        await storage.saveSession({ userId: newUser.id, isLoggedIn: true });
        setUser(newUser);
        setFavorites([]);
        return { ok: true };
      } catch {
        return { ok: false, message: 'Registration failed. Please try again.' };
      }
    },
    [],
  );

  const login = useCallback(async (values: LoginFormValues) => {
    try {
      const found = await storage.findUserByEmail(values.email.trim());
      if (!found || found.password !== values.password) {
        return { ok: false, message: 'Invalid email or password' };
      }

      await storage.saveSession({ userId: found.id, isLoggedIn: true });
      const favs = await storage.getFavoritesForUser(found.id);
      setUser(found);
      setFavorites(favs);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Login failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    await storage.clearSession();
    setUser(null);
    setFavorites([]);
  }, []);

  const updateProfile = useCallback(
    async (values: ProfileFormValues & { avatar?: string }) => {
      if (!user) {
        return { ok: false, message: 'No user logged in' };
      }

      try {
        // Prevent email collision with another account
        const users = await storage.getUsers();
        const emailTaken = users.some(
          u =>
            u.id !== user.id &&
            u.email.toLowerCase() === values.email.trim().toLowerCase(),
        );
        if (emailTaken) {
          return { ok: false, message: 'Email is already used by another account' };
        }

        const updated: User = {
          ...user,
          fullName: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          gender: values.gender as User['gender'],
          mobile: values.mobile.trim(),
          address: values.address.trim(),
          city: values.city,
          avatar: values.avatar ?? user.avatar,
          password:
            values.password && values.password.length > 0
              ? values.password
              : user.password,
          updatedAt: new Date().toISOString(),
        };

        await storage.upsertUser(updated);
        setUser(updated);
        return { ok: true };
      } catch {
        return { ok: false, message: 'Failed to update profile' };
      }
    },
    [user],
  );

  const setAvatar = useCallback(
    async (avatar: string) => {
      if (!user) {
        return;
      }
      const updated = {
        ...user,
        avatar,
        updatedAt: new Date().toISOString(),
      };
      await storage.upsertUser(updated);
      setUser(updated);
    },
    [user],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.some(f => f.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (image: GalleryImage) => {
      if (!user) {
        return;
      }

      setFavorites(prev => {
        const exists = prev.some(f => f.id === image.id);
        const next = exists
          ? prev.filter(f => f.id !== image.id)
          : [
              ...prev,
              { ...image, favoritedAt: new Date().toISOString() } as FavoriteImage,
            ];

        // Persist asynchronously (fire-and-forget with catch)
        storage.saveFavoritesForUser(user.id, next).catch(() => undefined);
        return next;
      });
    },
    [user],
  );

  const removeFavorite = useCallback(
    async (id: string) => {
      if (!user) {
        return;
      }
      setFavorites(prev => {
        const next = prev.filter(f => f.id !== id);
        storage.saveFavoritesForUser(user.id, next).catch(() => undefined);
        return next;
      });
    },
    [user],
  );

  const toggleTheme = useCallback(async () => {
    setThemeMode(prev => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      storage.saveThemeMode(next).catch(() => undefined);
      return next;
    });
  }, []);

  const colors = themeMode === 'dark' ? darkColors : lightColors;

  const value = useMemo<AppContextValue>(
    () => ({
      bootstrapping,
      user,
      isLoggedIn: !!user,
      register,
      login,
      logout,
      updateProfile,
      setAvatar,
      favorites,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      themeMode,
      colors,
      isDark: themeMode === 'dark',
      toggleTheme,
    }),
    [
      bootstrapping,
      user,
      register,
      login,
      logout,
      updateProfile,
      setAvatar,
      favorites,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      themeMode,
      colors,
      toggleTheme,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
