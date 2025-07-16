import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseAuth } from './firebase';

export interface PrivacySettings {
  profileVisibility: 'public' | 'students' | 'private';
  showActivityStatus: boolean;
  showReadReceipts: boolean;
  allowDataSharing: boolean;
  hideNotificationContent: boolean;
  preventScreenshots: boolean;
}

export interface LoginActivity {
  id: string;
  timestamp: string;
  device: string;
  location: string;
  ipAddress: string;
  success: boolean;
}

export interface AppPermission {
  name: string;
  description: string;
  granted: boolean;
  required: boolean;
  type: 'camera' | 'files' | 'notifications' | 'storage';
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: 'students',
  showActivityStatus: true,
  showReadReceipts: true,
  allowDataSharing: false,
  hideNotificationContent: false,
  preventScreenshots: false,
};

class PrivacySecurityService {
  private static readonly PRIVACY_STORAGE_KEY = 'privacy_settings';
  private static readonly LOGIN_ACTIVITY_KEY = 'login_activity';
  
  private privacySettings: PrivacySettings = DEFAULT_PRIVACY_SETTINGS;
  private loginActivity: LoginActivity[] = [];

  async loadPrivacySettings(): Promise<PrivacySettings> {
    try {
      const stored = await AsyncStorage.getItem(PrivacySecurityService.PRIVACY_STORAGE_KEY);
      if (stored) {
        this.privacySettings = { ...DEFAULT_PRIVACY_SETTINGS, ...JSON.parse(stored) };
      }
      return this.privacySettings;
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      return DEFAULT_PRIVACY_SETTINGS;
    }
  }

  async updatePrivacySetting<K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ): Promise<void> {
    try {
      this.privacySettings = { ...this.privacySettings, [key]: value };
      await AsyncStorage.setItem(
        PrivacySecurityService.PRIVACY_STORAGE_KEY,
        JSON.stringify(this.privacySettings)
      );
    } catch (error) {
      console.error('Error updating privacy setting:', error);
    }
  }

  getPrivacySettings(): PrivacySettings {
    return { ...this.privacySettings };
  }

  // Password Management
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!currentPassword || !newPassword) {
        return { success: false, error: 'Please fill in all fields' };
      }

      if (newPassword.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters' };
      }

      // Use the mock Firebase auth to change password
      await firebaseAuth.changePassword(currentPassword, newPassword);

      // Log this security event
      await this.logSecurityEvent('password_changed');

      return { success: true };
    } catch (error: any) {
      console.error('Error changing password:', error);

      let errorMessage = 'Failed to change password';
      if (error.message.includes('Current password is incorrect')) {
        errorMessage = 'Current password is incorrect';
      } else if (error.message.includes('must be at least 6 characters')) {
        errorMessage = 'New password must be at least 6 characters';
      } else if (error.message.includes('No authenticated user')) {
        errorMessage = 'Please log in again to change your password';
      }

      return { success: false, error: errorMessage };
    }
  }

  // Login Activity Management
  async getLoginActivity(): Promise<LoginActivity[]> {
    try {
      const stored = await AsyncStorage.getItem(PrivacySecurityService.LOGIN_ACTIVITY_KEY);
      if (stored) {
        this.loginActivity = JSON.parse(stored);
      } else {
        // Generate some mock login activity for demonstration
        this.loginActivity = this.generateMockLoginActivity();
        await this.saveLoginActivity();
      }
      return [...this.loginActivity].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error loading login activity:', error);
      return [];
    }
  }

  private generateMockLoginActivity(): LoginActivity[] {
    const now = new Date();
    return [
      {
        id: '1',
        timestamp: now.toISOString(),
        device: 'Current Device (Android)',
        location: 'Lagos, Nigeria',
        ipAddress: '192.168.1.100',
        success: true,
      },
      {
        id: '2',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        device: 'Mobile Device',
        location: 'Lagos, Nigeria',
        ipAddress: '192.168.1.100',
        success: true,
      },
      {
        id: '3',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        device: 'Mobile Device',
        location: 'Abuja, Nigeria',
        ipAddress: '10.0.0.50',
        success: false,
      },
    ];
  }

  private async saveLoginActivity(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        PrivacySecurityService.LOGIN_ACTIVITY_KEY,
        JSON.stringify(this.loginActivity)
      );
    } catch (error) {
      console.error('Error saving login activity:', error);
    }
  }

  async logSecurityEvent(event: string): Promise<void> {
    const newActivity: LoginActivity = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      device: 'Current Device',
      location: 'Lagos, Nigeria',
      ipAddress: '192.168.1.100',
      success: true,
    };

    this.loginActivity.unshift(newActivity);
    
    // Keep only last 20 activities
    if (this.loginActivity.length > 20) {
      this.loginActivity = this.loginActivity.slice(0, 20);
    }

    await this.saveLoginActivity();
  }

  // Data Management (Simplified version)
  async exportUserData(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Simulate user data export
      const userData = {
        profile: {
          uid: 'mock-user-id',
          email: 'user@example.com',
          displayName: 'Mock User',
          photoURL: null,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          lastSignIn: new Date().toISOString(),
        },
        settings: {
          privacy: await this.loadPrivacySettings(),
          app: await AsyncStorage.getItem('app_settings'),
        },
        activity: {
          loginHistory: await this.getLoginActivity(),
        },
        exportedAt: new Date().toISOString(),
      };

      return { success: true, data: userData };
    } catch (error) {
      console.error('Error exporting user data:', error);
      return { success: false, error: 'Failed to export data' };
    }
  }

  async clearAppData(): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear all stored data except authentication
      const keysToRemove = [
        'app_settings',
        'privacy_settings',
        'login_activity',
        'notification_preferences',
        // Add other keys as needed
      ];

      await AsyncStorage.multiRemove(keysToRemove);
      
      // Reset to defaults
      this.privacySettings = DEFAULT_PRIVACY_SETTINGS;
      this.loginActivity = [];

      return { success: true };
    } catch (error) {
      console.error('Error clearing app data:', error);
      return { success: false, error: 'Failed to clear app data' };
    }
  }

  async clearCache(): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear cache-related data
      const cacheKeys = [
        'cached_announcements',
        'cached_events',
        'cached_files',
        'image_cache',
      ];

      await AsyncStorage.multiRemove(cacheKeys);
      return { success: true };
    } catch (error) {
      console.error('Error clearing cache:', error);
      return { success: false, error: 'Failed to clear cache' };
    }
  }

  // App Permissions
  getAppPermissions(): AppPermission[] {
    return [
      {
        name: 'Camera',
        description: 'Take photos for profile and file uploads',
        granted: true,
        required: false,
        type: 'camera',
      },
      {
        name: 'File Access',
        description: 'Upload and download files',
        granted: true,
        required: true,
        type: 'files',
      },
      {
        name: 'Notifications',
        description: 'Receive push notifications',
        granted: true,
        required: false,
        type: 'notifications',
      },
      {
        name: 'Storage',
        description: 'Store app data and cache',
        granted: true,
        required: true,
        type: 'storage',
      },
    ];
  }

  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear all user data first
      await this.clearAppData();

      // Simulate account deletion (in real app, this would delete Firebase user)
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting account:', error);
      return { success: false, error: 'Failed to delete account. Please try again.' };
    }
  }
}

export const privacySecurityService = new PrivacySecurityService();
