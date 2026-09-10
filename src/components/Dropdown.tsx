/**
 * Simple dropdown / picker modal for City selection.
 */

import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { radius, typography } from '../theme';
import Icon from './Icon';

interface DropdownProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  error,
}) => {
  const { colors } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error ? colors.error : colors.border,
            borderWidth: error ? 1.5 : 1,
          },
        ]}>
        <Text
          style={{
            color: value ? colors.text : colors.textSecondary,
            flex: 1,
          }}>
          {value || placeholder}
        </Text>
        <Icon name="chevron-down" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={() => setOpen(false)}>
          <View
            style={[styles.sheet, { backgroundColor: colors.surface }]}
            onStartShouldSetResponder={() => true}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {label}
            </Text>
            <FlatList
              data={[...options]}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    {
                      backgroundColor:
                        item === value ? colors.primary + '22' : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}>
                  <Text style={{ color: colors.text, fontSize: 16 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: 6,
  },
  trigger: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  error: {
    ...typography.small,
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    maxHeight: '70%',
    borderRadius: radius.lg,
    padding: 16,
  },
  sheetTitle: {
    ...typography.h3,
    marginBottom: 8,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
});

export default Dropdown;
