import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Shield, Key, Eye, Download, Trash2, Settings } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';

export default function PrivacySecuritySimpleScreen() {
  const { user, logout } = useAuth();
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [showReadReceipts, setShowReadReceipts] = useState(true);
  const [hideNotificationContent, setHideNotificationContent] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Password change functionality is temporarily disabled. This feature will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data export would include:\n\n• Profile information\n• App settings\n• Privacy preferences\n• Activity history\n\nThis feature will be fully implemented in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary files and cached data. Your settings and personal data will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Your account and all associated data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Are you absolutely sure? This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Account Deleted', 'Your account has been deleted.');
                    logout();
                  }
                }
              ]
            );
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

  const renderActionItem = (
    title: string,
    description: string,
    onPress: () => void,
    icon: React.ReactNode,
    danger?: boolean
  ) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && { color: COLORS.error }]}>
            {title}
          </Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Security */}
        {renderSectionHeader('Account Security', <Shield size={20} color={COLORS.primary} />)}
        
        {renderActionItem(
          'Change Password',
          'Update your account password',
          handleChangePassword,
          <Key size={16} color={COLORS.primary} />
        )}

        {/* Privacy Controls */}
        {renderSectionHeader('Privacy Controls', <Eye size={20} color={COLORS.primary} />)}
        
        {renderSettingItem(
          'Show Activity Status',
          'Let others see when you\'re active',
          showActivityStatus,
          setShowActivityStatus
        )}

        {renderSettingItem(
          'Show Read Receipts',
          'Let others know when you\'ve read announcements',
          showReadReceipts,
          setShowReadReceipts
        )}

        {renderSettingItem(
          'Hide Notification Content',
          'Hide notification details on lock screen',
          hideNotificationContent,
          setHideNotificationContent
        )}

        {/* Data Management */}
        {renderSectionHeader('Data Management', <Settings size={20} color={COLORS.primary} />)}
        
        {renderActionItem(
          'Export My Data',
          'Download a copy of your personal data',
          handleExportData,
          <Download size={16} color={COLORS.primary} />
        )}

        {renderActionItem(
          'Clear Cache',
          'Free up storage space by clearing temporary files',
          handleClearCache,
          <Trash2 size={16} color={COLORS.secondary} />
        )}

        {/* Danger Zone */}
        {renderSectionHeader('Danger Zone', <Trash2 size={20} color={COLORS.error} />)}
        
        {renderActionItem(
          'Delete Account',
          'Permanently delete your account and all data',
          handleDeleteAccount,
          <Trash2 size={16} color={COLORS.error} />,
          true
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your privacy and security are important to us
          </Text>
          <Text style={styles.versionText}>
            CampusConnect v1.0 • Privacy & Security Center
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
  placeholder: {
    width: 40,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionItem: {
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
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
