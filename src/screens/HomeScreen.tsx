/**
 * Home Screen – paginated gallery with header search, filters,
 * pull-to-refresh, FlashList infinite scroll, and favorite toggles.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import {
  EmptyState,
  FilterBar,
  Header,
  ImageCard,
  Loading,
} from '../components';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { RootStackParamList } from '../navigation/types';
import { AuthorFilter, GalleryImage } from '../types';
import { filterImages } from '../utils/helpers';
import { spacing, typography } from '../theme';

const HomeScreen: React.FC = () => {
  const { colors, isFavorite, toggleFavorite } = useApp();
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();

  const {
    images,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
  } = usePagination();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AuthorFilter>('All');
  const debouncedSearch = useDebounce(search, 350);

  const visibleImages = useMemo(
    () => filterImages(images, debouncedSearch, filter),
    [images, debouncedSearch, filter],
  );

  const onPressImage = useCallback(
    (image: GalleryImage) => {
      navigation.navigate('ImageDetails', { image });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: GalleryImage }) => (
      <ImageCard
        image={item}
        favorited={isFavorite(item.id)}
        onPress={() => onPressImage(item)}
        onToggleFavorite={() => toggleFavorite(item)}
      />
    ),
    [isFavorite, onPressImage, toggleFavorite],
  );

  const keyExtractor = useCallback((item: GalleryImage) => item.id, []);

  const onEndReached = useCallback(() => {
    if (hasMore) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  if (loading && images.length === 0) {
    return <Loading message="Loading gallery…" />;
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header
        title="Gallery"
        searchable
        searchValue={search}
        onSearchChange={setSearch}
      />
      <View style={styles.content}>
        <FilterBar value={filter} onChange={setFilter} />

        {error && images.length === 0 ? (
          <EmptyState
            title="Couldn’t load images"
            subtitle={error}
            actionLabel="Retry"
            onAction={refresh}
          />
        ) : (
          <FlashList
            data={visibleImages}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            style={styles.flex}
            contentContainerStyle={
              visibleImages.length === 0 ? styles.emptyList : styles.list
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={
              <EmptyState
                title="No images found"
                subtitle="Try a different search or filter."
              />
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footer}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={{ color: colors.textSecondary, marginTop: 6 }}>
                    Loading more…
                  </Text>
                </View>
              ) : !hasMore && visibleImages.length > 0 ? (
                <Text style={[styles.end, { color: colors.textSecondary }]}>
                  You’re all caught up
                </Text>
              ) : (
                <View />
              )
            }
          />
        )}
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
  list: {
    paddingBottom: spacing.xxl,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  end: {
    ...typography.caption,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});

export default HomeScreen;
