/**
 * Thin wrapper around Ionicons for consistent sizing and theming.
 */

import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  style?: object;
}

const Icon: React.FC<IconProps> = ({ name, size = 22, color, style }) => (
  <Ionicons name={name} size={size} color={color} style={style} />
);

export default Icon;
