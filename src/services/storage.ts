/**
 * AsyncStorage persistence layer.
 * Batches multi-key reads/writes via getMany/setMany (AsyncStorage v3 API).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSession, FavoriteImage, ThemeMode, User } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

/** Batch-read several JSON keys in one AsyncStorage.getMany call */
const multiGetJson = async <T>(
  keys: string[],
): Promise<Record<string, T | null>> => {
  const raw = await AsyncStorage.getMany(keys);
  const result: Record<string, T | null> = {};

  keys.forEach(key => {
    const value = raw[key];
    if (value == null) {
      result[key] = null;
      return;
    }
    try {
      result[key] = JSON.parse(value) as T;
    } catch {
      result[key] = null;
    }
  });

  return result;
};

const setJson = async (key: string, value: unknown): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const getUsers = async (): Promise<User[]> => {
  const data = await multiGetJson<User[]>([STORAGE_KEYS.USERS]);
  return data[STORAGE_KEYS.USERS] ?? [];
};

export const saveUsers = async (users: User[]): Promise<void> => {
  await setJson(STORAGE_KEYS.USERS, users);
};

export const findUserByEmail = async (
  email: string,
): Promise<User | undefined> => {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const upsertUser = async (user: User): Promise<User[]> => {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  await saveUsers(users);
  return users;
};

// ─── Session ─────────────────────────────────────────────────────────────────

export const getSession = async (): Promise<AppSession> => {
  const data = await multiGetJson<AppSession>([STORAGE_KEYS.SESSION]);
  return (
    data[STORAGE_KEYS.SESSION] ?? {
      userId: null,
      isLoggedIn: false,
    }
  );
};

export const saveSession = async (session: AppSession): Promise<void> => {
  await setJson(STORAGE_KEYS.SESSION, session);
};

export const clearSession = async (): Promise<void> => {
  await saveSession({ userId: null, isLoggedIn: false });
};

// ─── Favorites (keyed by userId) ─────────────────────────────────────────────

type FavoritesMap = Record<string, FavoriteImage[]>;

export const getAllFavorites = async (): Promise<FavoritesMap> => {
  const data = await multiGetJson<FavoritesMap>([STORAGE_KEYS.FAVORITES]);
  return data[STORAGE_KEYS.FAVORITES] ?? {};
};

export const getFavoritesForUser = async (
  userId: string,
): Promise<FavoriteImage[]> => {
  const all = await getAllFavorites();
  return all[userId] ?? [];
};

export const saveFavoritesForUser = async (
  userId: string,
  favorites: FavoriteImage[],
): Promise<void> => {
  const all = await getAllFavorites();
  all[userId] = favorites;
  await setJson(STORAGE_KEYS.FAVORITES, all);
};

// ─── Theme ───────────────────────────────────────────────────────────────────

export const getThemeMode = async (): Promise<ThemeMode> => {
  const data = await multiGetJson<ThemeMode>([STORAGE_KEYS.THEME]);
  return data[STORAGE_KEYS.THEME] ?? 'light';
};

export const saveThemeMode = async (mode: ThemeMode): Promise<void> => {
  await setJson(STORAGE_KEYS.THEME, mode);
};

/**
 * Bootstrap load – batch-reads session, users, theme in one getMany.
 * Favorites are loaded after we know the active userId.
 */
export const loadBootstrapState = async (): Promise<{
  session: AppSession;
  users: User[];
  theme: ThemeMode;
}> => {
  const data = await multiGetJson<unknown>([
    STORAGE_KEYS.SESSION,
    STORAGE_KEYS.USERS,
    STORAGE_KEYS.THEME,
  ]);

  return {
    session: (data[STORAGE_KEYS.SESSION] as AppSession) ?? {
      userId: null,
      isLoggedIn: false,
    },
    users: (data[STORAGE_KEYS.USERS] as User[]) ?? [],
    theme: (data[STORAGE_KEYS.THEME] as ThemeMode) ?? 'light',
  };
};
