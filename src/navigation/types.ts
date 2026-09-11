/**
 * Navigation param list types for Auth, Tabs, and Root stacks.
 */

import { GalleryImage } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Registration: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  ImageDetails: { image: GalleryImage };
  EditProfile: undefined;
};
