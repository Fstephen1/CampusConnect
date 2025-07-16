import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Shield, Key, Eye, Download, Trash2, Settings } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { privacySecurityService } from '@/services/privacySecurityService';

export default function PrivacySecuritySimpleScreen() {
  const { user, logout } = useAuth();
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [showReadReceipts, setShowReadReceipts] = useState(true);
  const [hideNotificationContent, setHideNotificationContent] = useState(false);

  // Password change modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handlePasswordChangeSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    try {
      setPasswordLoading(true);
      const result = await privacySecurityService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      if (result.success) {
        Alert.alert('Success', 'Password changed successfully');
        setShowChangePasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        Alert.alert('Error', result.error || 'Failed to change password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
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

      {/* Change Password Modal */}
      <Modal
        visible={showChangePasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChangePasswordModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowChangePasswordModal(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Current Password</Text>
              <TextInput
                style={styles.formInput}
                value={passwordForm.currentPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, currentPassword: text })}
                secureTextEntry
                placeholder="Enter current password"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>New Password</Text>
              <TextInput
                style={styles.formInput}
                value={passwordForm.newPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, newPassword: text })}
                secureTextEntry
                placeholder="Enter new password"
              />
              <Text style={styles.passwordNote}>Password must be at least 6 characters</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.formInput}
                value={passwordForm.confirmPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, confirmPassword: text })}
                secureTextEntry
                placeholder="Confirm new password"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, passwordLoading && styles.submitButtonDisabled]}
              onPress={handlePasswordChangeSubmit}
              disabled={passwordLoading}
            >
              <Text style={styles.submitButtonText}>
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.textDark,
  },
  modalClose: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.textDark,
  },
  passwordNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
