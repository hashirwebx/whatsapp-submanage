import { useState } from 'react';
import { Bell, Globe, DollarSign, Lock, Smartphone, Mail, Moon, Shield, Loader2, RefreshCw, Download, Trash2, Key, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { WhatsAppConnection } from './WhatsAppConnection';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'sonner@2.0.3';

interface SettingsProps {
  user: any;
}

export function Settings({ user }: SettingsProps) {
  const {
    settings,
    isLoading,
    isSaving,
    updateSetting,
    updateMultipleSettings,
    refreshSettings,
    resetToDefaults,
    changePassword,
    exportUserData,
    deleteAccount,
    verifyWhatsAppNumber,
    disconnectWhatsApp,
  } = useSettings();

  // Dialog states
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePasswordConfirm, setDeletePasswordConfirm] = useState('');
  const [whatsappPhoneInput, setWhatsappPhoneInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    const success = await changePassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (success) {
      setIsPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePasswordConfirm) {
      toast.error('Please enter your password to confirm');
      return;
    }

    setIsSubmitting(true);
    const success = await deleteAccount(deletePasswordConfirm);
    setIsSubmitting(false);

    if (success) {
      // Account deleted, user will be logged out
      setIsDeleteDialogOpen(false);
    }
  };

  const handleExportData = async () => {
    await exportUserData();
  };

  const handleVerifyWhatsApp = async () => {
    if (!whatsappPhoneInput) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsSubmitting(true);
    const success = await verifyWhatsAppNumber(whatsappPhoneInput);
    setIsSubmitting(false);

    if (success) {
      await updateSetting('whatsappPhone', whatsappPhoneInput);
      setIsWhatsAppDialogOpen(false);
      setWhatsappPhoneInput('');
    }
  };

  const handleDisconnectWhatsApp = async () => {
    const confirmed = window.confirm('Are you sure you want to disconnect WhatsApp?');
    if (confirmed) {
      await disconnectWhatsApp();
    }
  };

  const handleResetDefaults = async () => {
    const confirmed = window.confirm('Are you sure you want to reset all settings to defaults?');
    if (confirmed) {
      await resetToDefaults();
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences and account settings</p>
          </div>
          <Button 
            onClick={refreshSettings} 
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {user?.isDemo && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              🎭 <strong>Demo Mode:</strong> Settings changes won't be saved. Create an account to save your preferences.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={20} />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure how you receive subscription reminders and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>WhatsApp Notifications</Label>
                <p className="text-sm text-muted-foreground">Get reminders on WhatsApp</p>
              </div>
              <Switch
                checked={settings.whatsappNotifications}
                onCheckedChange={(checked) => updateSetting('whatsappNotifications', checked)}
                disabled={isSaving || !settings.whatsappConnected}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Browser push notifications</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="mb-3 font-semibold">Reminder Schedule</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>7 days before payment</Label>
                  <Switch
                    checked={settings.reminderDays7}
                    onCheckedChange={(checked) => updateSetting('reminderDays7', checked)}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>3 days before payment</Label>
                  <Switch
                    checked={settings.reminderDays3}
                    onCheckedChange={(checked) => updateSetting('reminderDays3', checked)}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Day of payment (urgent)</Label>
                  <Switch
                    checked={settings.reminderUrgent}
                    onCheckedChange={(checked) => updateSetting('reminderUrgent', checked)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="mb-3 font-semibold">Smart Alerts</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Price change notifications</Label>
                  <Switch
                    checked={settings.priceChangeAlerts}
                    onCheckedChange={(checked) => updateSetting('priceChangeAlerts', checked)}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Duplicate service detection</Label>
                  <Switch
                    checked={settings.duplicateDetection}
                    onCheckedChange={(checked) => updateSetting('duplicateDetection', checked)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={20} />
              General Settings
            </CardTitle>
            <CardDescription>
              Language, currency, and regional preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Select 
                value={settings.currency} 
                onValueChange={(value) => updateSetting('currency', value)}
                disabled={isSaving}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                  <SelectItem value="PKR">PKR - Pakistani Rupee (₨)</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee (₹)</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen (¥)</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar ($)</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar ($)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                This will affect how prices are displayed throughout the app
              </p>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select 
                value={settings.language} 
                onValueChange={(value) => updateSetting('language', value)}
                disabled={isSaving}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Language switching coming soon
              </p>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={settings.timezone} 
                onValueChange={(value) => updateSetting('timezone', value)}
                disabled={isSaving}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                  <SelectItem value="Asia/Karachi">Pakistan (PKT)</SelectItem>
                  <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                This affects when you receive reminders
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Enable dark theme</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone size={20} />
              WhatsApp Integration
            </CardTitle>
            <CardDescription>
              Connect your WhatsApp number to receive subscription reminders and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.isDemo ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  🎭 <strong>Demo Mode:</strong> WhatsApp connection is not available in demo mode. Create an account to use this feature.
                </p>
              </div>
            ) : (
              <>
                <WhatsAppConnection 
                  accessToken={user?.accessToken || ''} 
                  onConnectionChange={(connected) => {
                    refreshSettings();
                  }}
                />

                {settings.whatsappConnected && settings.whatsappVerified && (
                  <>
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto-Reply</Label>
                          <p className="text-sm text-muted-foreground">Respond automatically to messages</p>
                        </div>
                        <Switch
                          checked={settings.autoReply}
                          onCheckedChange={(checked) => updateSetting('autoReply', checked)}
                          disabled={isSaving}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="flex items-center gap-2 mb-2">
                        <Shield size={16} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold">Security & Privacy</span>
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>✅ End-to-end encryption for all messages</li>
                        <li>✅ GDPR compliant data handling</li>
                        <li>✅ No data sharing with third parties</li>
                        <li>✅ Secure verification process</li>
                      </ul>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Control your data and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add extra security to your account</p>
              </div>
              <Badge variant={settings.twoFactorAuth ? "default" : "secondary"}>
                {settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Usage Analytics</Label>
                <p className="text-sm text-muted-foreground">Help us improve the app</p>
              </div>
              <Switch
                checked={settings.analyticsTracking}
                onCheckedChange={(checked) => updateSetting('analyticsTracking', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Sharing</Label>
                <p className="text-sm text-muted-foreground">Share anonymized data with partners</p>
              </div>
              <Switch
                checked={settings.dataSharing}
                onCheckedChange={(checked) => updateSetting('dataSharing', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="border-t pt-4 space-y-3">
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" disabled={user?.isDemo}>
                    <Lock size={16} className="mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new one
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePasswordChange} disabled={isSubmitting}>
                      {isSubmitting ? 'Changing...' : 'Change Password'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleExportData}
                disabled={user?.isDemo}
              >
                <Download size={16} className="mr-2" />
                Export My Data (GDPR)
              </Button>

              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    disabled={user?.isDemo}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Label htmlFor="delete-confirm">Enter your password to confirm</Label>
                    <Input
                      id="delete-confirm"
                      type="password"
                      value={deletePasswordConfirm}
                      onChange={(e) => setDeletePasswordConfirm(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Deleting...' : 'Delete Account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
              <h4 className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold">Our Privacy Commitment</span>
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✅ End-to-end encryption for all messages</li>
                <li>✅ GDPR compliant data handling</li>
                <li>✅ Zero data-selling policy</li>
                <li>✅ Regular security audits</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleResetDefaults}
            disabled={isSaving || user?.isDemo}
          >
            Reset to Defaults
          </Button>
          <Badge variant="secondary" className="flex items-center gap-2 px-4">
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Auto-saved
              </>
            )}
          </Badge>
        </div>
      </div>
    </div>
  );
}