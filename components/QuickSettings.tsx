import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Settings, Bell, BellOff, Volume2, VolumeX } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useAppSettings } from '@/context/AppSettingsContext';
import { router } from 'expo-router';

export default function QuickSettings() {
  const { settings, updateSetting } = useAppSettings();

  const toggleNotifications = () => {
    updateSetting('pushNotificationsEnabled', !settings.pushNotificationsEnabled);
  };

  const toggleSound = () => {
    const newSound = settings.notificationSound === 'none' ? 'default' : 'none';
    updateSetting('notificationSound', newSound);
  };

  const openFullSettings = () => {
    router.push('/settings');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Settings</Text>
      
      <View style={styles.settingsRow}>
        <TouchableOpacity 
          style={[
            styles.quickButton,
            !settings.pushNotificationsEnabled && styles.quickButtonDisabled
          ]}
          onPress={toggleNotifications}
        >
          {settings.pushNotificationsEnabled ? (
            <Bell size={20} color={COLORS.primary} />
          ) : (
            <BellOff size={20} color={COLORS.textLight} />
          )}
          <Text style={[
            styles.quickButtonText,
            !settings.pushNotificationsEnabled && styles.quickButtonTextDisabled
          ]}>
            Notifications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.quickButton,
            settings.notificationSound === 'none' && styles.quickButtonDisabled
          ]}
          onPress={toggleSound}
        >
          {settings.notificationSound !== 'none' ? (
            <Volume2 size={20} color={COLORS.primary} />
          ) : (
            <VolumeX size={20} color={COLORS.textLight} />
          )}
          <Text style={[
            styles.quickButtonText,
            settings.notificationSound === 'none' && styles.quickButtonTextDisabled
          ]}>
            Sound
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickButton} onPress={openFullSettings}>
          <Settings size={20} color={COLORS.primary} />
          <Text style={styles.quickButtonText}>All Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickButtonDisabled: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
  },
  quickButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.textDark,
    marginTop: 4,
    textAlign: 'center',
  },
  quickButtonTextDisabled: {
    color: COLORS.textLight,
  },
});
