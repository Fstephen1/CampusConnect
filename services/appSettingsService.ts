import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  // Notification Settings
  pushNotificationsEnabled: boolean;
  announcementNotifications: boolean;
  eventNotifications: boolean;
  systemNotifications: boolean;
  notificationSound: 'default' | 'bell' | 'chime' | 'none';
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
  
  // Theme Settings
  theme: 'light' | 'dark' | 'system';
  
  // Display Settings
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  showProfilePictures: boolean;
  
  // Account Settings
  autoLogout: boolean;
  autoLogoutTime: number; // minutes
  biometricLogin: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  // Notification Settings
  pushNotificationsEnabled: true,
  announcementNotifications: true,
  eventNotifications: true,
  systemNotifications: true,
  notificationSound: 'default',
  vibrationEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  
  // Theme Settings
  theme: 'system',
  
  // Display Settings
  fontSize: 'medium',
  compactMode: false,
  showProfilePictures: true,
  
  // Account Settings
  autoLogout: false,
  autoLogoutTime: 30,
  biometricLogin: false,
};

class AppSettingsService {
  private static readonly STORAGE_KEY = 'app_settings';
  private settings: AppSettings = DEFAULT_SETTINGS;
  private listeners: ((settings: AppSettings) => void)[] = [];

  async loadSettings(): Promise<AppSettings> {
    try {
      const stored = await AsyncStorage.getItem(AppSettingsService.STORAGE_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
      return this.settings;
    } catch (error) {
      console.error('Error loading app settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(newSettings: Partial<AppSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await AsyncStorage.setItem(
        AppSettingsService.STORAGE_KEY,
        JSON.stringify(this.settings)
      );
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving app settings:', error);
    }
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> {
    await this.saveSettings({ [key]: value } as Partial<AppSettings>);
  }

  async resetToDefaults(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AppSettingsService.STORAGE_KEY);
      this.settings = { ...DEFAULT_SETTINGS };
      this.notifyListeners();
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  }

  // Listener management for real-time updates
  addListener(listener: (settings: AppSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  // Helper methods for specific settings
  isQuietHours(): boolean {
    if (!this.settings.quietHoursEnabled) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = this.settings.quietHoursStart;
    const end = this.settings.quietHoursEnd;
    
    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }
    
    return currentTime >= start && currentTime <= end;
  }

  shouldShowNotification(type: 'announcement' | 'event' | 'system'): boolean {
    if (!this.settings.pushNotificationsEnabled) return false;
    if (this.isQuietHours()) return false;
    
    switch (type) {
      case 'announcement':
        return this.settings.announcementNotifications;
      case 'event':
        return this.settings.eventNotifications;
      case 'system':
        return this.settings.systemNotifications;
      default:
        return true;
    }
  }
}

export const appSettingsService = new AppSettingsService();
