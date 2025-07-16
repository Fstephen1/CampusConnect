import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppSettings, appSettingsService } from '@/services/appSettingsService';

interface AppSettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
  loading: boolean;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

interface AppSettingsProviderProps {
  children: ReactNode;
}

export function AppSettingsProvider({ children }: AppSettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(appSettingsService.getSettings());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    
    // Listen for settings changes
    const unsubscribe = appSettingsService.addListener((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const loadedSettings = await appSettingsService.loadSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    try {
      await appSettingsService.updateSetting(key, value);
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const resetSettings = async () => {
    try {
      await appSettingsService.resetToDefaults();
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  const value: AppSettingsContextType = {
    settings,
    updateSetting,
    resetSettings,
    loading,
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettingsContextType {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}
