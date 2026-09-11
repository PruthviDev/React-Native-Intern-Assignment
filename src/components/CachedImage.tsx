/**
 * Image component used across the gallery.
 * Uses React Native Image (react-native-fast-image is unreliable on New Architecture
 * and can trigger "runtime is not ready" crashes).
 */

import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface CachedImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
}) => (
  <Image source={{ uri }} style={style} resizeMode={resizeMode} />
);

export default CachedImage;
