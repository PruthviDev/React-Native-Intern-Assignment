/**
 * Gallery list item card – thumbnail, author, ID, and animated favorite heart.
 */

import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { GalleryImage } from '../types';
import { getThumbnailUrl } from '../utils/helpers';
import { radius, spacing, typography } from '../theme';
import Card from './Card';
import CachedImage from './CachedImage';
import Icon from './Icon';

interface ImageCardProps {
  image: GalleryImage;
  onPress: () => void;
  onToggleFavorite: () => void;
  favorited: boolean;
  /** When true, show a remove action label instead of heart */
  showRemove?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onPress,
  onToggleFavorite,
  favorited,
  showRemove = false,
}) => {
  const { colors } = useApp();
  const scale = useSharedValue(1);
  const didMount = useRef(false);

  useEffect(() => {
    // Skip mount so recycled list cells don't pulse on scroll
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    scale.value = withSequence(
      withSpring(1.28, { damping: 12, stiffness: 240 }),
      withSpring(1, { damping: 14, stiffness: 200 }),
    );
  }, [favorited, scale]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Card style={styles.card}>
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.row}>
        <CachedImage
          uri={getThumbnailUrl(image, 200)}
          style={[styles.thumb, { backgroundColor: colors.imagePlaceholder }]}
          resizeMode="cover"
        />
        <View style={styles.meta}>
          <Text
            numberOfLines={2}
            style={[styles.author, { color: colors.text }]}>
            {image.author}
          </Text>
          <Text style={{ color: colors.textSecondary, ...typography.caption }}>
            ID: {image.id}
          </Text>
          <Text style={{ color: colors.textSecondary, ...typography.small }}>
            {image.width} × {image.height}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityLabel={
          favorited ? 'Remove from favorites' : 'Add to favorites'
        }
        onPress={onToggleFavorite}
        style={styles.favBtn}
        hitSlop={8}>
        {showRemove ? (
          <Text
            style={{
              fontSize: 13,
              color: colors.favorite,
              fontWeight: '600',
            }}>
            Remove
          </Text>
        ) : (
          <Animated.View style={heartStyle}>
            <Icon
              name={favorited ? 'heart' : 'heart-outline'}
              size={24}
              color={favorited ? colors.favorite : colors.favoriteInactive}
            />
          </Animated.View>
        )}
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
  },
  meta: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  author: {
    ...typography.bodyBold,
    marginBottom: 2,
  },
  favBtn: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(ImageCard);
