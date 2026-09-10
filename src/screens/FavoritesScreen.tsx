/**
 * Favorites Screen – lists favorited images with search and remove.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import {
  EmptyState,
  Header,
  ImageCard,
  SearchBar,
} from '../components';
import { useDebounce } from '../hooks/useDebounce';
import { RootStackParamList } from '../navigation/types';
import { FavoriteImage } from '../types';
import { matchesSearch } from '../utils/helpers';
import { spacing } from '../theme';

const FavoritesScreen: React.FC = () => {
  const { colors, favorites, removeFavorite } = useApp();
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const visible = useMemo(
    () => favorites.filter(img => matchesSearch(img, debouncedSearch)),
    [favorites, debouncedSearch],
  );

  const onPressImage = useCallback(
    (item: FavoriteImage) => {
      navigation.navigate('ImageDetails', { image: item });
    },
    [navigation],
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header title="Favorites" />
      <View style={styles.content}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search favorites…"
        />

        <FlatList
          data={visible}
          keyExtractor={item => item.id}
          contentContainerStyle={
            visible.length === 0 ? styles.emptyList : styles.list
          }
          renderItem={({ item }: { item: FavoriteImage }) => (
            <ImageCard
              image={item}
              favorited
              showRemove
              onPress={() => onPressImage(item)}
              onToggleFavorite={() => removeFavorite(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No favorites yet"
              subtitle="Tap the heart on any gallery image to save it here."
            />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  list: { paddingBottom: spacing.xxl },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default FavoritesScreen;
