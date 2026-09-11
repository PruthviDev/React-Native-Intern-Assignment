/**
 * Profile Screen – shows user info, theme toggle, avatar, logout.
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { usePopup } from '../context/PopupContext';
import { AvatarPicker, Button, Card, Header } from '../components';
import { RootStackParamList } from '../navigation/types';
import { spacing, typography } from '../theme';

const ProfileRow = ({
  label,
  value,
  labelColor,
  valueColor,
}: {
  label: string;
  value: string;
  labelColor: string;
  valueColor: string;
}) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
    <Text style={[styles.rowValue, { color: valueColor }]}>{value}</Text>
  </View>
);

const ProfileScreen: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, user, isDark, toggleTheme, logout, setAvatar } = useApp();
  const { showPopup } = usePopup();
  const insets = useSafeAreaInsets();

  if (!user) {
    return null;
  }

  const onLogout = () => {
    showPopup({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      actions: [
        { label: 'Cancel', variant: 'secondary' },
        {
          label: 'Logout',
          variant: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ],
    });
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header title="Profile" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.avatarHero}>
          <Text style={styles.bigAvatar}>{user.avatar ?? '👤'}</Text>
          <Text style={[styles.name, { color: colors.text }]}>
            {user.fullName}
          </Text>
          <Text style={{ color: colors.textSecondary }}>{user.email}</Text>
        </View>

        <Card>
          <ProfileRow
            label="Gender"
            value={user.gender}
            labelColor={colors.textSecondary}
            valueColor={colors.text}
          />
          <ProfileRow
            label="Mobile"
            value={user.mobile}
            labelColor={colors.textSecondary}
            valueColor={colors.text}
          />
          <ProfileRow
            label="Address"
            value={user.address}
            labelColor={colors.textSecondary}
            valueColor={colors.text}
          />
          <ProfileRow
            label="City"
            value={user.city}
            labelColor={colors.textSecondary}
            valueColor={colors.text}
          />
        </Card>

        <Card>
          <View style={styles.themeRow}>
            <View style={styles.themeText}>
              <Text style={[styles.themeTitle, { color: colors.text }]}>
                Dark Mode
              </Text>
              <Text
                style={{ color: colors.textSecondary, ...typography.caption }}>
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => toggleTheme()}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </Card>

        <AvatarPicker value={user.avatar} onChange={setAvatar} />

        <Button
          title="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.btn}
        />
        <Button
          title="Logout"
          onPress={onLogout}
          variant="danger"
          style={styles.btn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: spacing.lg,
  },
  avatarHero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bigAvatar: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.h2,
  },
  row: {
    marginBottom: spacing.sm + 2,
  },
  rowLabel: {
    ...typography.caption,
    marginBottom: 2,
  },
  rowValue: {
    ...typography.body,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeText: {
    flex: 1,
    marginRight: spacing.md,
  },
  themeTitle: {
    ...typography.bodyBold,
    marginBottom: 2,
  },
  btn: {
    marginBottom: spacing.sm + 2,
  },
});

export default ProfileScreen;
