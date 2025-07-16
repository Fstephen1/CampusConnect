import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Bell, Palette, Type, User, Volume2, Moon, Sun, Smartphone, Clock, Shield } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useAppSettings } from '@/context/AppSettingsContext';
import { useAuth } from '@/hooks/useAuth';

export default function AppSettingsScreen() {
  const { settings, updateSetting, resetSettings } = useAppSettings();
  const { user } = useAuth();
  const [showTimePickerModal, setShowTimePickerModal] = useState<'start' | 'end' | null>(null);

  const handleGoBack = () => {
    router.back();
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetSettings();
            Alert.alert('Success', 'Settings have been reset to default values');
          }
        }
      ]
    );
  };

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon?: React.ReactNode
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        {icon && <View style={styles.settingIcon}>{icon}</View>}
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e0e0e0', true: COLORS.primary + '80' }}
        thumbColor={value ? COLORS.primary : '#f4f3f4'}
      />
    </View>
  );

  const renderPickerItem = (
    title: string,
    description: string,
    currentValue: string,
    options: { label: string; value: string }[],
    onSelect: (value: string) => void,
    icon?: React.ReactNode
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        {icon && <View style={styles.settingIcon}>{icon}</View>}
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
          <Text style={styles.currentValue}>Current: {options.find(o => o.value === currentValue)?.label}</Text>
        </View>
      </View>
      <View style={styles.pickerContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.pickerOption,
              currentValue === option.value && styles.pickerOptionSelected
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[
              styles.pickerOptionText,
              currentValue === option.value && styles.pickerOptionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <TouchableOpacity onPress={handleResetSettings} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Settings */}
        {renderSectionHeader('Notifications', <Bell size={20} color={COLORS.primary} />)}
        
        {renderSettingItem(
          'Push Notifications',
          'Enable push notifications for all types',
          settings.pushNotificationsEnabled,
          (value) => updateSetting('pushNotificationsEnabled', value),
          <Smartphone size={16} color={COLORS.primary} />
        )}

        {settings.pushNotificationsEnabled && (
          <>
            {renderSettingItem(
              'Announcement Notifications',
              'Get notified about new announcements',
              settings.announcementNotifications,
              (value) => updateSetting('announcementNotifications', value)
            )}

            {renderSettingItem(
              'Event Notifications',
              'Get notified about new events',
              settings.eventNotifications,
              (value) => updateSetting('eventNotifications', value)
            )}

            {renderSettingItem(
              'System Notifications',
              'Get notified about system updates',
              settings.systemNotifications,
              (value) => updateSetting('systemNotifications', value)
            )}

            {renderPickerItem(
              'Notification Sound',
              'Choose notification sound',
              settings.notificationSound,
              [
                { label: 'Default', value: 'default' },
                { label: 'Bell', value: 'bell' },
                { label: 'Chime', value: 'chime' },
                { label: 'Silent', value: 'none' }
              ],
              (value) => updateSetting('notificationSound', value as any),
              <Volume2 size={16} color={COLORS.primary} />
            )}

            {renderSettingItem(
              'Vibration',
              'Vibrate when receiving notifications',
              settings.vibrationEnabled,
              (value) => updateSetting('vibrationEnabled', value)
            )}

            {renderSettingItem(
              'Quiet Hours',
              'Disable notifications during quiet hours',
              settings.quietHoursEnabled,
              (value) => updateSetting('quietHoursEnabled', value),
              <Clock size={16} color={COLORS.primary} />
            )}

            {settings.quietHoursEnabled && (
              <View style={styles.quietHoursContainer}>
                <Text style={styles.quietHoursText}>
                  Quiet hours: {settings.quietHoursStart} - {settings.quietHoursEnd}
                </Text>
                <Text style={styles.quietHoursNote}>
                  Tap to change quiet hours (feature coming soon)
                </Text>
              </View>
            )}
          </>
        )}

        {/* Theme Settings */}
        {renderSectionHeader('Theme', <Palette size={20} color={COLORS.primary} />)}
        
        {renderPickerItem(
          'App Theme',
          'Choose your preferred theme',
          settings.theme,
          [
            { label: 'System Default', value: 'system' },
            { label: 'Light Mode', value: 'light' },
            { label: 'Dark Mode', value: 'dark' }
          ],
          (value) => updateSetting('theme', value as any),
          settings.theme === 'light' ? <Sun size={16} color={COLORS.primary} /> : <Moon size={16} color={COLORS.primary} />
        )}

        {/* Display Settings */}
        {renderSectionHeader('Display', <Type size={20} color={COLORS.primary} />)}
        
        {renderPickerItem(
          'Font Size',
          'Adjust text size throughout the app',
          settings.fontSize,
          [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
          ],
          (value) => updateSetting('fontSize', value as any),
          <Type size={16} color={COLORS.primary} />
        )}

        {renderSettingItem(
          'Compact Mode',
          'Show more content in less space',
          settings.compactMode,
          (value) => updateSetting('compactMode', value)
        )}

        {renderSettingItem(
          'Show Profile Pictures',
          'Display profile pictures in announcements',
          settings.showProfilePictures,
          (value) => updateSetting('showProfilePictures', value)
        )}

        {/* Account Settings */}
        {renderSectionHeader('Account', <User size={20} color={COLORS.primary} />)}
        
        {renderSettingItem(
          'Auto Logout',
          'Automatically logout after inactivity',
          settings.autoLogout,
          (value) => updateSetting('autoLogout', value),
          <Shield size={16} color={COLORS.primary} />
        )}

        {settings.autoLogout && (
          <View style={styles.autoLogoutContainer}>
            <Text style={styles.autoLogoutText}>
              Auto logout after {settings.autoLogoutTime} minutes of inactivity
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Settings are automatically saved
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.textDark,
  },
  resetButton: {
    padding: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.error,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.textDark,
    marginLeft: 10,
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
  },
  currentValue: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary,
    marginTop: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pickerOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.textMedium,
  },
  pickerOptionTextSelected: {
    color: 'white',
  },
  quietHoursContainer: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  quietHoursText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary,
  },
  quietHoursNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    marginTop: 4,
  },
  autoLogoutContainer: {
    backgroundColor: COLORS.secondary + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  autoLogoutText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.secondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.textLight,
  },
});
