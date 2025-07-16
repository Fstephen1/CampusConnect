import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Switch, Alert, TextInput, Modal } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { LogOut, Settings, ChevronRight, CreditCard as Edit2, User, Bell, Shield, CircleHelp as HelpCircle, X, Users } from 'lucide-react-native';
import { notificationRoleService } from '@/services/notificationRoleService';
import { NotificationRole, UserNotificationPreferences } from '@/types/notificationRoles';
import RoleManagement from '@/components/RoleManagement';
import NotificationStatus from '@/components/NotificationStatus';

export default function ProfileScreen() {
  const { user, logout, loading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [showNotificationRoles, setShowNotificationRoles] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<NotificationRole[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserNotificationPreferences | null>(null);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [showRoleManagement, setShowRoleManagement] = useState(false);

  // Update editName when user changes
  useEffect(() => {
    if (user?.displayName) {
      setEditName(user.displayName);
    }
  }, [user?.displayName]);

  useEffect(() => {
    if (user && user.role === 'student') {
      loadNotificationData();
    }
  }, [user]);

  const loadNotificationData = async () => {
    if (!user) return;

    try {
      setLoadingRoles(true);
      const [roles, preferences] = await Promise.all([
        notificationRoleService.getAllRoles(),
        notificationRoleService.getUserPreferences(user.uid)
      ]);
      setAvailableRoles(roles);
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Error loading notification data:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const toggleRoleSubscription = async (roleId: string) => {
    if (!user || !userPreferences) return;

    try {
      const isSubscribed = userPreferences.subscribedRoles.includes(roleId);
      const newSubscribedRoles = isSubscribed
        ? userPreferences.subscribedRoles.filter(id => id !== roleId)
        : [...userPreferences.subscribedRoles, roleId];

      const updatedPreferences = await notificationRoleService.updateUserPreferences(user.uid, {
        subscribedRoles: newSubscribedRoles
      });

      setUserPreferences(updatedPreferences);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification preferences');
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Don't manually navigate - let the app handle it when user becomes null
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const toggleEditing = () => {
    if (isEditing) {
      setEditName(user?.displayName || '');
    }
    setIsEditing(!isEditing);
  };

  const saveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      setUpdatingProfile(true);
      await updateProfile({ displayName: editName });
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error(error);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return COLORS.error;
      case 'teacher':
        return COLORS.secondary;
      default:
        return COLORS.primary;
    }
  };

  const getRoleDisplayText = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatarContainer}>
          {user.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileAvatar} />
          ) : (
            <View style={styles.profileAvatarPlaceholder}>
              <User size={40} color={COLORS.primary} />
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarButton}>
            <Edit2 size={16} color="white" />
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <View style={styles.editNameContainer}>
            <TextInput
              style={styles.editNameInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              autoFocus
            />
            <View style={styles.editButtonsContainer}>
              <TouchableOpacity 
                style={[styles.editActionButton, styles.cancelButton]} 
                onPress={toggleEditing}
              >
                <Text style={[styles.editActionButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editActionButton, styles.saveButton]}
                onPress={saveProfile}
                disabled={updatingProfile}
              >
                {updatingProfile ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.editActionButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.profileNameContainer}>
              <Text style={styles.profileName}>{user.displayName || getRoleDisplayText(user.role)}</Text>
              <TouchableOpacity onPress={toggleEditing}>
                <Edit2 size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <View style={[
              styles.roleBadge,
              { backgroundColor: getRoleBadgeColor(user.role) }
            ]}>
              <Text style={styles.roleText}>{getRoleDisplayText(user.role)}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Bell size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingDescription}>Receive push notifications</Text>
            <NotificationStatus />
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#e0e0e0', true: COLORS.primary + '80' }}
            thumbColor={notificationsEnabled ? COLORS.primary : '#f4f3f4'}
          />
        </View>

        {user?.role === 'student' && (
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowNotificationRoles(true)}
          >
            <View style={styles.settingIconContainer}>
              <Bell size={20} color={COLORS.secondary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Notification Roles</Text>
              <Text style={styles.settingDescription}>
                Choose which announcements you want to receive
              </Text>
            </View>
            <View style={styles.roleCountContainer}>
              <Text style={styles.roleCountText}>
                {userPreferences?.subscribedRoles.length || 0}
              </Text>
              <ChevronRight size={20} color={COLORS.textLight} />
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Shield size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Privacy & Security</Text>
            <Text style={styles.settingDescription}>Manage your privacy settings</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Settings size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>App Settings</Text>
            <Text style={styles.settingDescription}>Customize your experience</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {user?.role === 'admin' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Administration</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowRoleManagement(true)}
          >
            <View style={styles.settingIconContainer}>
              <Users size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Manage Notification Roles</Text>
              <Text style={styles.settingDescription}>Create and manage notification roles</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <HelpCircle size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Help & FAQ</Text>
            <Text style={styles.settingDescription}>Get answers to common questions</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={COLORS.error} />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
      
      <Text style={styles.versionText}>CampusConnect v1.0.0</Text>
      </ScrollView>

      <Modal
      visible={showNotificationRoles}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Notification Roles</Text>
          <TouchableOpacity
            onPress={() => setShowNotificationRoles(false)}
            style={styles.modalCloseButton}
          >
            <X size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <Text style={styles.modalDescription}>
          Choose which types of announcements you want to receive. You can select multiple roles.
        </Text>

        <ScrollView style={styles.modalContent}>
          {loadingRoles ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.modalLoadingText}>Loading roles...</Text>
            </View>
          ) : (
            availableRoles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={styles.roleItem}
                onPress={() => toggleRoleSubscription(role.id)}
              >
                <View style={styles.roleInfo}>
                  <View style={[styles.roleColorIndicator, { backgroundColor: role.color }]} />
                  <View style={styles.roleTextContainer}>
                    <Text style={styles.roleName}>{role.name}</Text>
                    <Text style={styles.roleDescription}>{role.description}</Text>
                  </View>
                </View>
                <View style={[
                  styles.roleCheckbox,
                  userPreferences?.subscribedRoles.includes(role.id) && styles.roleCheckboxActive
                ]}>
                  {userPreferences?.subscribedRoles.includes(role.id) && (
                    <Text style={styles.roleCheckboxCheck}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
      </Modal>

      <RoleManagement
        visible={showRoleManagement}
        onClose={() => setShowRoleManagement(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 12,
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileAvatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: COLORS.textDark,
    marginRight: 8,
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMedium,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
  },
  editNameContainer: {
    width: '100%',
    alignItems: 'center',
  },
  editNameInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  editActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.textLight,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  editActionButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: 'white',
  },
  cancelButtonText: {
    color: COLORS.textDark,
  },
  sectionContainer: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.textDark,
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.textDark,
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  logoutButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.error,
    marginLeft: 8,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  roleCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleCountText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 8,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: COLORS.textDark,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMedium,
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalLoadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 12,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  roleDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMedium,
  },
  roleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleCheckboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleCheckboxCheck: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
});