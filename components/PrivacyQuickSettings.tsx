import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, Activity, Shield, Settings } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { privacySecurityService, PrivacySettings } from '@/services/privacySecurityService';
import { router } from 'expo-router';

export default function PrivacyQuickSettings() {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const settings = await privacySecurityService.loadPrivacySettings();
      setPrivacySettings(settings);
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const toggleActivityStatus = async () => {
    if (!privacySettings) return;
    
    try {
      const newValue = !privacySettings.showActivityStatus;
      await privacySecurityService.updatePrivacySetting('showActivityStatus', newValue);
      setPrivacySettings({ ...privacySettings, showActivityStatus: newValue });
    } catch (error) {
      console.error('Error updating activity status:', error);
    }
  };

  const toggleReadReceipts = async () => {
    if (!privacySettings) return;
    
    try {
      const newValue = !privacySettings.showReadReceipts;
      await privacySecurityService.updatePrivacySetting('showReadReceipts', newValue);
      setPrivacySettings({ ...privacySettings, showReadReceipts: newValue });
    } catch (error) {
      console.error('Error updating read receipts:', error);
    }
  };

  const openFullPrivacySettings = () => {
    router.push('/privacy-security');
  };

  if (!privacySettings) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Controls</Text>
      
      <View style={styles.settingsRow}>
        <TouchableOpacity 
          style={[
            styles.quickButton,
            !privacySettings.showActivityStatus && styles.quickButtonDisabled
          ]}
          onPress={toggleActivityStatus}
        >
          <Activity 
            size={20} 
            color={privacySettings.showActivityStatus ? COLORS.primary : COLORS.textLight} 
          />
          <Text style={[
            styles.quickButtonText,
            !privacySettings.showActivityStatus && styles.quickButtonTextDisabled
          ]}>
            Activity
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.quickButton,
            !privacySettings.showReadReceipts && styles.quickButtonDisabled
          ]}
          onPress={toggleReadReceipts}
        >
          {privacySettings.showReadReceipts ? (
            <Eye size={20} color={COLORS.primary} />
          ) : (
            <EyeOff size={20} color={COLORS.textLight} />
          )}
          <Text style={[
            styles.quickButtonText,
            !privacySettings.showReadReceipts && styles.quickButtonTextDisabled
          ]}>
            Read Status
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickButton} onPress={openFullPrivacySettings}>
          <Shield size={20} color={COLORS.primary} />
          <Text style={styles.quickButtonText}>All Privacy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusText}>
          Activity: {privacySettings.showActivityStatus ? 'Visible' : 'Hidden'} • 
          Read Status: {privacySettings.showReadReceipts ? 'Shown' : 'Hidden'}
        </Text>
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
    marginBottom: 8,
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
  statusRow: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
