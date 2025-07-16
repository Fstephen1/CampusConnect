import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput } from 'react-native';
import { router } from 'expo-router';
import { 
  ArrowLeft, Shield, Key, Eye, EyeOff, Download, Trash2, 
  Activity, Settings, Lock, Smartphone, FileText, Camera,
  Bell, HardDrive, AlertTriangle
} from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { 
  privacySecurityService, 
  PrivacySettings, 
  LoginActivity, 
  AppPermission 
} from '@/services/privacySecurityService';
import { formatDistanceToNow } from 'date-fns';
import PasswordRequirements from '@/components/PasswordRequirements';

export default function PrivacySecurityScreen() {
  const { user, logout } = useAuth();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([]);
  const [appPermissions, setAppPermissions] = useState<AppPermission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showLoginActivityModal, setShowLoginActivityModal] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [privacy, activity, permissions] = await Promise.all([
        privacySecurityService.loadPrivacySettings(),
        privacySecurityService.getLoginActivity(),
        Promise.resolve(privacySecurityService.getAppPermissions()),
      ]);
      
      setPrivacySettings(privacy);
      setLoginActivity(activity);
      setAppPermissions(permissions);
    } catch (error) {
      console.error('Error loading privacy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const updatePrivacySetting = async <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    if (!privacySettings) return;
    
    try {
      await privacySecurityService.updatePrivacySetting(key, value);
      setPrivacySettings({ ...privacySettings, [key]: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update privacy setting');
    }
  };

  const handleChangePassword = async () => {
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

  const handleExportData = async () => {
    try {
      const result = await privacySecurityService.exportUserData();
      if (result.success) {
        Alert.alert(
          'Data Export Ready',
          'Your data has been prepared for export. In a real app, this would be downloaded as a file.',
          [
            { text: 'OK', onPress: () => setShowDataExportModal(false) }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to export data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary files and cached data. Your settings and personal data will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          onPress: async () => {
            const result = await privacySecurityService.clearCache();
            if (result.success) {
              Alert.alert('Success', 'Cache cleared successfully');
            } else {
              Alert.alert('Error', result.error || 'Failed to clear cache');
            }
          }
        }
      ]
    );
  };

  const handleClearAppData = async () => {
    Alert.alert(
      'Clear All App Data',
      'This will reset the app to its initial state. All your settings and preferences will be lost. You will remain logged in.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            const result = await privacySecurityService.clearAppData();
            if (result.success) {
              Alert.alert('Success', 'App data cleared successfully. Please restart the app.');
            } else {
              Alert.alert('Error', result.error || 'Failed to clear app data');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Your account and all associated data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            const result = await privacySecurityService.deleteAccount();
            if (result.success) {
              Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
              logout();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete account');
            }
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

  if (loading || !privacySettings) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading privacy settings...</Text>
      </View>
    );
  }

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
          () => setShowChangePasswordModal(true),
          <Key size={16} color={COLORS.primary} />
        )}

        {renderActionItem(
          'Login Activity',
          'View recent login attempts and sessions',
          () => setShowLoginActivityModal(true),
          <Activity size={16} color={COLORS.primary} />
        )}

        {/* Privacy Controls */}
        {renderSectionHeader('Privacy Controls', <Eye size={20} color={COLORS.primary} />)}
        
        {renderSettingItem(
          'Show Activity Status',
          'Let others see when you\'re active',
          privacySettings.showActivityStatus,
          (value) => updatePrivacySetting('showActivityStatus', value),
          <Activity size={16} color={COLORS.primary} />
        )}

        {renderSettingItem(
          'Show Read Receipts',
          'Let others know when you\'ve read announcements',
          privacySettings.showReadReceipts,
          (value) => updatePrivacySetting('showReadReceipts', value),
          <Eye size={16} color={COLORS.primary} />
        )}

        {renderSettingItem(
          'Hide Notification Content',
          'Hide notification details on lock screen',
          privacySettings.hideNotificationContent,
          (value) => updatePrivacySetting('hideNotificationContent', value),
          <Bell size={16} color={COLORS.primary} />
        )}

        {renderSettingItem(
          'Prevent Screenshots',
          'Block screenshots in sensitive areas',
          privacySettings.preventScreenshots,
          (value) => updatePrivacySetting('preventScreenshots', value),
          <Lock size={16} color={COLORS.primary} />
        )}

        {/* Data Management */}
        {renderSectionHeader('Data Management', <HardDrive size={20} color={COLORS.primary} />)}
        
        {renderActionItem(
          'Export My Data',
          'Download a copy of your personal data',
          () => setShowDataExportModal(true),
          <Download size={16} color={COLORS.primary} />
        )}

        {renderActionItem(
          'Clear Cache',
          'Free up storage space by clearing temporary files',
          handleClearCache,
          <Trash2 size={16} color={COLORS.secondary} />
        )}

        {renderActionItem(
          'Clear App Data',
          'Reset app to initial state (keeps account)',
          handleClearAppData,
          <Settings size={16} color={COLORS.warning} />
        )}

        {/* Danger Zone */}
        {renderSectionHeader('Danger Zone', <AlertTriangle size={20} color={COLORS.error} />)}
        
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
                placeholder="Enter new password (min. 6 characters)"
              />
              <PasswordRequirements
                password={passwordForm.newPassword}
                confirmPassword={passwordForm.confirmPassword}
                showConfirmation={passwordForm.confirmPassword.length > 0}
              />
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
              onPress={handleChangePassword}
              disabled={passwordLoading}
            >
              <Text style={styles.submitButtonText}>
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Login Activity Modal */}
      <Modal
        visible={showLoginActivityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLoginActivityModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Login Activity</Text>
              <TouchableOpacity onPress={() => setShowLoginActivityModal(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.activityList}>
              {loginActivity.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityDevice}>{activity.device}</Text>
                    <Text style={[
                      styles.activityStatus,
                      { color: activity.success ? COLORS.success : COLORS.error }
                    ]}>
                      {activity.success ? 'Success' : 'Failed'}
                    </Text>
                  </View>
                  <Text style={styles.activityLocation}>{activity.location}</Text>
                  <Text style={styles.activityTime}>
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Data Export Modal */}
      <Modal
        visible={showDataExportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDataExportModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Export My Data</Text>
              <TouchableOpacity onPress={() => setShowDataExportModal(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.exportDescription}>
              This will create a file containing all your personal data including:
            </Text>

            <View style={styles.exportList}>
              <Text style={styles.exportItem}>• Profile information</Text>
              <Text style={styles.exportItem}>• App settings and preferences</Text>
              <Text style={styles.exportItem}>• Login activity history</Text>
              <Text style={styles.exportItem}>• Privacy settings</Text>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleExportData}>
              <Text style={styles.submitButtonText}>Export Data</Text>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  activityList: {
    maxHeight: 300,
  },
  activityItem: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityDevice: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textDark,
  },
  activityStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  activityLocation: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.textLight,
  },
  exportDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    marginBottom: 16,
    lineHeight: 20,
  },
  exportList: {
    marginBottom: 20,
  },
  exportItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textDark,
    marginBottom: 8,
    lineHeight: 20,
  },
});
