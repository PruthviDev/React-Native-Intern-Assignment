/**
 * Image Details Screen – polished image card, metadata, download & share.
 */

import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Share from 'react-native-share';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useApp } from '../context/AppContext';
import { usePopup } from '../context/PopupContext';
import { Button, Header } from '../components';
import { RootStackParamList } from '../navigation/types';
import { cardShadow, radius, spacing, typography } from '../theme';
import { handleNetworkError } from '../services/networkError';

type Props = StackScreenProps<RootStackParamList, 'ImageDetails'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_H_PAD = spacing.lg;
const IMAGE_WIDTH = SCREEN_WIDTH - IMAGE_H_PAD * 2;

/** Ensure we have permission to write photos on Android */
const ensurePhotoPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : 33;
  const permission =
    apiLevel >= 33
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

  const current = await check(permission);
  if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) {
    return true;
  }

  const asked = await request(permission);
  return asked === RESULTS.GRANTED || asked === RESULTS.LIMITED;
};

const ImageDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { image } = route.params;
  const { colors, isDark, isFavorite, toggleFavorite } = useApp();
  const { showPopup } = usePopup();
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Preserve aspect ratio without stretching
  const imageHeight = useMemo(() => {
    if (!image.width || !image.height) {
      return IMAGE_WIDTH * 0.75;
    }
    const ratio = image.height / image.width;
    return Math.min(Math.max(IMAGE_WIDTH * ratio, 180), SCREEN_WIDTH * 1.1);
  }, [image.width, image.height]);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  const downloadImage = async () => {
    try {
      setDownloading(true);
      const allowed = await ensurePhotoPermission();
      if (!allowed) {
        showPopup({
          title: 'Permission required',
          message: 'Please allow photo library access to save images.',
        });
        return;
      }

      const path = `${RNFS.CachesDirectoryPath}/picsum_${image.id}.jpg`;

      const result = await RNFS.downloadFile({
        fromUrl: image.download_url,
        toFile: path,
      }).promise;

      if (result.statusCode && result.statusCode >= 400) {
        throw new Error(`Download failed (${result.statusCode})`);
      }

      await CameraRoll.save(`file://${path}`, { type: 'photo' });
      showPopup({
        title: 'Saved',
        message: 'Image saved to your device gallery.',
      });
    } catch (err) {
      const normalized = handleNetworkError(err, { silent: true });
      showPopup({
        title: 'Download failed',
        message: normalized.message,
      });
    } finally {
      setDownloading(false);
    }
  };

  const shareImage = async () => {
    try {
      setSharing(true);
      const path = `${RNFS.CachesDirectoryPath}/share_${image.id}.jpg`;
      await RNFS.downloadFile({
        fromUrl: image.download_url,
        toFile: path,
      }).promise;

      await Share.open({
        title: `Photo by ${image.author}`,
        message: `Check out this photo by ${image.author} (ID: ${image.id})`,
        url: `file://${path}`,
        type: 'image/jpeg',
        failOnCancel: false,
      });
    } catch (err) {
      if (err instanceof Error && !err.message.includes('User did not share')) {
        const normalized = handleNetworkError(err, { silent: true });
        showPopup({
          title: 'Share failed',
          message: normalized.message,
        });
      }
    } finally {
      setSharing(false);
    }
  };

  const favorited = isFavorite(image.id);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header title="Image Details" onBack={goBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.imageCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            cardShadow(colors, isDark),
          ]}>
          <ScrollView
            style={[styles.zoomWrap, { height: imageHeight }]}
            contentContainerStyle={styles.zoomContent}
            maximumZoomScale={4}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            centerContent>
            <Image
              source={{ uri: image.download_url }}
              style={{
                width: IMAGE_WIDTH - spacing.md * 2,
                height: imageHeight,
                borderRadius: radius.sm,
                backgroundColor: colors.imagePlaceholder,
              }}
              resizeMode="contain"
            />
          </ScrollView>
        </View>

        <View
          style={[
            styles.metaCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            cardShadow(colors, isDark),
          ]}>
          <Text style={[styles.author, { color: colors.text }]}>
            {image.author}
          </Text>
          <Text style={{ color: colors.textSecondary, ...typography.body }}>
            ID: {image.id}
          </Text>
          <Text style={{ color: colors.textSecondary, ...typography.caption }}>
            Resolution: {image.width} × {image.height}
          </Text>
        </View>

        <Button
          title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
          onPress={() => toggleFavorite(image)}
          variant={favorited ? 'outline' : 'primary'}
          style={styles.btn}
        />
        <Button
          title="Download to Gallery"
          onPress={downloadImage}
          loading={downloading}
          style={styles.btn}
        />
        <Button
          title="Share Image"
          onPress={shareImage}
          loading={sharing}
          variant="outline"
          style={styles.btn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.md,
  },
  imageCard: {
    marginHorizontal: IMAGE_H_PAD,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    overflow: 'hidden',
  },
  zoomWrap: {
    borderRadius: radius.sm,
  },
  zoomContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaCard: {
    margin: spacing.lg,
    padding: spacing.md + 2,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  author: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  btn: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm + 2,
  },
});

export default ImageDetailsScreen;
