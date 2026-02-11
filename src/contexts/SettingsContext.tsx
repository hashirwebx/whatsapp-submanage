import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSettings, updateSettings } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { useTheme } from './ThemeContext';

export interface UserSettings {
  // Notification Settings
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  pushNotifications: boolean;
  reminderDays7: boolean;
  reminderDays3: boolean;
  reminderUrgent: boolean;
  priceChangeAlerts: boolean;
  duplicateDetection: boolean;

  // General Settings
  currency: string;
  language: string;
  timezone: string;
  darkMode: boolean;

  // Privacy Settings
  dataSharing: boolean;
  analyticsTracking: boolean;
  twoFactorAuth: boolean;

  // WhatsApp Settings
  whatsappPhone: string;
  whatsappConnected: boolean;
  whatsappVerified: boolean;
  autoReply: boolean;
  lastSync?: string;
}

interface SettingsContextType {
  settings: UserSettings;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  updateSetting: (key: keyof UserSettings, value: any) => Promise<void>;
  updateMultipleSettings: (updates: Partial<UserSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
  resetCurrencyToOriginal: () => Promise<void>; // Reset all subscriptions to original currency

  // Security actions
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  exportUserData: () => Promise<void>;
  deleteAccount: (password: string) => Promise<boolean>;
  setup2FA: () => Promise<any>;
  disable2FA: () => Promise<boolean>;

  // WhatsApp actions
  verifyWhatsAppNumber: (phoneNumber: string) => Promise<boolean>;
  disconnectWhatsApp: () => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettings = {
  emailNotifications: true,
  whatsappNotifications: true,
  pushNotifications: false,
  reminderDays7: true,
  reminderDays3: true,
  reminderUrgent: true,
  priceChangeAlerts: true,
  duplicateDetection: true,
  currency: 'USD',
  language: 'en',
  timezone: 'America/New_York',
  darkMode: false,
  dataSharing: false,
  analyticsTracking: true,
  twoFactorAuth: false,
  whatsappPhone: '',
  whatsappConnected: false,
  whatsappVerified: false,
  autoReply: true,
};

interface SettingsProviderProps {
  children: ReactNode;
  user: any;
}

export function SettingsProvider({ children, user }: SettingsProviderProps) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTheme } = useTheme();

  // Load settings from server
  const loadSettings = useCallback(async () => {
    if (!user || user.isDemo) {
      console.log('SettingsContext: Demo mode or no user, using defaults');
      setSettings(DEFAULT_SETTINGS);
      setIsLoading(false);
      return;
    }

    if (!user.accessToken) {
      console.error('SettingsContext: No access token available');
      setError('Session expired. Please log in again.');
      setIsLoading(false);
      return;
    }

    console.log('SettingsContext: Loading settings for authenticated user');
    setIsLoading(true);
    setError(null);

    try {
      const response = await getSettings(user.accessToken);
      console.log('SettingsContext: Settings loaded successfully');

      const loadedSettings = { ...DEFAULT_SETTINGS, ...response.settings };
      setSettings(loadedSettings);

      // Sync dark mode with theme context
      if (loadedSettings.darkMode) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    } catch (error: any) {
      console.error('SettingsContext: Failed to load settings:', error);
      setError(error.message || 'Failed to load settings');
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, [user, setTheme]);

  // Initial load
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save settings to server
  const saveSettings = async (newSettings: UserSettings) => {
    if (user?.isDemo) {
      toast.error('Cannot save settings in demo mode. Please create an account.');
      return false;
    }

    if (!user?.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      setIsSaving(true);
      await updateSettings(user.accessToken, newSettings);
      return true;
    } catch (error: any) {
      console.error('SettingsContext: Failed to save settings:', error);
      toast.error('Failed to save settings: ' + error.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update single setting
  const updateSetting = async (key: keyof UserSettings, value: any) => {
    console.log(`SettingsContext: Updating ${key} to`, value);

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Special handling for dark mode
    if (key === 'darkMode') {
      setTheme(value ? 'dark' : 'light');
    }

    // Special handling for push notifications
    if (key === 'pushNotifications' && value === true) {
      await requestPushNotificationPermission();
    }

    const success = await saveSettings(newSettings);
    if (success) {
      toast.success('Setting updated successfully');
    }
  };

  // Update multiple settings at once
  const updateMultipleSettings = async (updates: Partial<UserSettings>) => {
    console.log('SettingsContext: Updating multiple settings', updates);

    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    // Handle dark mode if included
    if ('darkMode' in updates) {
      setTheme(updates.darkMode ? 'dark' : 'light');
    }

    const success = await saveSettings(newSettings);
    if (success) {
      toast.success('Settings saved successfully');
    }
  };

  // Refresh settings from server
  const refreshSettings = async () => {
    console.log('SettingsContext: Manual refresh triggered');
    await loadSettings();
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    console.log('SettingsContext: Resetting to defaults');
    setSettings(DEFAULT_SETTINGS);
    setTheme('light');

    if (!user?.isDemo && user?.accessToken) {
      const success = await saveSettings(DEFAULT_SETTINGS);
      if (success) {
        toast.success('Settings reset to defaults');
      }
    } else {
      toast.success('Settings reset to defaults');
    }
  };

  // Request push notification permission
  const requestPushNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast.error('Push notifications are blocked. Please enable them in your browser settings.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Push notifications enabled');
        return true;
      } else {
        toast.error('Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      toast.error('Failed to enable push notifications');
      return false;
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (user?.isDemo) {
      toast.error('Cannot change password in demo mode');
      return false;
    }

    if (!user?.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      const { changePassword: changePasswordAPI } = await import('../utils/api');
      await changePasswordAPI(user.accessToken, currentPassword, newPassword);
      toast.success('Password changed successfully. Please log in with your new password.');

      // Log out user after password change
      setTimeout(() => {
        localStorage.removeItem('subtrack_user');
        window.location.reload();
      }, 2000);

      return true;
    } catch (error: any) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password: ' + error.message);
      return false;
    }
  };

  // Export user data (GDPR)
  const exportUserData = async () => {
    if (user?.isDemo) {
      toast.error('Cannot export data in demo mode');
      return;
    }

    if (!user?.accessToken) {
      toast.error('Session expired. Please log in again.');
      return;
    }

    toast.info('Preparing your data export... This may take a few moments.');

    try {
      const { exportUserData: exportUserDataAPI } = await import('../utils/api');
      const response = await exportUserDataAPI(user.accessToken);

      // Create a downloadable JSON file
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `subtrack-data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully! Check your downloads folder.');
    } catch (error: any) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data: ' + error.message);
    }
  };

  // Delete account
  const deleteAccount = async (password: string): Promise<boolean> => {
    if (user?.isDemo) {
      toast.error('Cannot delete account in demo mode');
      return false;
    }

    if (!user?.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      const { deleteUserAccount } = await import('../utils/api');
      await deleteUserAccount(user.accessToken, password);

      toast.success('Account deleted successfully. Goodbye!');

      // Clear session and redirect to login
      setTimeout(() => {
        localStorage.removeItem('subtrack_user');
        window.location.reload();
      }, 2000);

      return true;
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account: ' + error.message);
      return false;
    }
  };

  // Setup 2FA
  const setup2FA = async (): Promise<any> => {
    if (user?.isDemo) {
      toast.error('Cannot setup 2FA in demo mode');
      return null;
    }

    if (!user?.accessToken) {
      toast.error('Session expired. Please log in again.');
      return null;
    }

    // TODO: Implement actual 2FA setup endpoint
    toast.info('2FA setup will be implemented in a future update');
    return null;
  };

  // Disable 2FA
  const disable2FA = async (): Promise<boolean> => {
    if (user?.isDemo) {
      toast.error('Cannot disable 2FA in demo mode');
      return false;
    }

    if (!user?.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    // TODO: Implement actual 2FA disable endpoint
    toast.info('2FA disable will be implemented in a future update');
    return false;
  };

  // Verify WhatsApp number
  const verifyWhatsAppNumber = async (phoneNumber: string): Promise<boolean> => {
    if (user?.isDemo) {
      toast.error('Cannot verify WhatsApp in demo mode');
      return false;
    }

    if (!user?.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      const { sendWhatsAppVerification } = await import('../utils/whatsappVerification');

      toast.info('Sending verification code to ' + phoneNumber);

      const result = await sendWhatsAppVerification(
        phoneNumber,
        user.id,
        user.accessToken
      );

      if (result.success) {
        toast.success('Verification code sent! Check your WhatsApp.');
        return true;
      } else {
        toast.error(result.error || 'Failed to send verification code');
        return false;
      }
    } catch (error: any) {
      console.error('Failed to send verification:', error);
      toast.error('Failed to send verification code: ' + error.message);
      return false;
    }
  };

  // Disconnect WhatsApp
  const disconnectWhatsApp = async (): Promise<boolean> => {
    if (user?.isDemo) {
      toast.error('Cannot disconnect WhatsApp in demo mode');
      return false;
    }

    const newSettings = {
      ...settings,
      whatsappConnected: false,
      whatsappVerified: false,
      whatsappPhone: '',
    };

    setSettings(newSettings);
    const success = await saveSettings(newSettings);

    if (success) {
      toast.success('WhatsApp disconnected successfully');
    }

    return success;
  };

  const value: SettingsContextType = {
    settings,
    isLoading,
    isSaving,
    error,
    updateSetting,
    updateMultipleSettings,
    refreshSettings,
    resetToDefaults,
    changePassword,
    exportUserData,
    deleteAccount,
    setup2FA,
    disable2FA,
    verifyWhatsAppNumber,
    disconnectWhatsApp,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook to use the settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}