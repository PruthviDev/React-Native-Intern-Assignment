/**
 * Avatar picker grid for bonus avatar selection on Profile.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { AVATARS } from '../utils/constants';
import { typography } from '../theme';

interface AvatarPickerProps {
  value?: string;
  onChange: (avatar: string) => void;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({ value, onChange }) => {
  const { colors } = useApp();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.text }]}>Choose Avatar</Text>
      <View style={styles.grid}>
        {AVATARS.map(avatar => {
          const selected = value === avatar;
          return (
            <TouchableOpacity
              key={avatar}
              onPress={() => onChange(avatar)}
              style={[
                styles.item,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected
                    ? colors.primary + '22'
                    : colors.inputBackground,
                },
              ]}>
              <Text style={styles.emoji}>{avatar}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
});

export default AvatarPicker;
