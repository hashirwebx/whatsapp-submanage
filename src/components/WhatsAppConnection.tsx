import { useState, useEffect } from 'react';
import { Phone, Check, Loader2, AlertCircle, RefreshCw, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { WhatsAppSetupGuide } from './WhatsAppSetupGuide';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';

// Country code data with flags and validation patterns
const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States', pattern: /^[2-9]\d{9}$/, format: '(XXX) XXX-XXXX' },
  { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada', pattern: /^[2-9]\d{9}$/, format: '(XXX) XXX-XXXX' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom', pattern: /^\d{10}$/, format: 'XXXX XXX XXX' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India', pattern: /^[6-9]\d{9}$/, format: 'XXXXX XXXXX' },
  { code: '+92', country: 'PK', flag: '🇵🇰', name: 'Pakistan', pattern: /^3\d{9}$/, format: 'XXX XXXXXXX' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China', pattern: /^1[3-9]\d{9}$/, format: 'XXX XXXX XXXX' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan', pattern: /^\d{10}$/, format: 'XXX XXXX XXXX' },
  { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea', pattern: /^1\d{9,10}$/, format: 'XXX XXXX XXXX' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia', pattern: /^4\d{8}$/, format: 'XXX XXX XXX' },
  { code: '+64', country: 'NZ', flag: '🇳🇿', name: 'New Zealand', pattern: /^2\d{7,9}$/, format: 'XX XXX XXXX' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany', pattern: /^1\d{9,10}$/, format: 'XXX XXXXXXX' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France', pattern: /^[67]\d{8}$/, format: 'X XX XX XX XX' },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain', pattern: /^[67]\d{8}$/, format: 'XXX XX XX XX' },
  { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy', pattern: /^3\d{8,9}$/, format: 'XXX XXX XXXX' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE', pattern: /^5[0-9]\d{7}$/, format: 'XX XXX XXXX' },
  { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia', pattern: /^5[0-9]\d{7}$/, format: 'XX XXX XXXX' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa', pattern: /^[67]\d{8}$/, format: 'XX XXX XXXX' },
  { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil', pattern: /^[1-9]\d{10}$/, format: '(XX) XXXXX-XXXX' },
  { code: '+52', country: 'MX', flag: '🇲🇽', name: 'Mexico', pattern: /^1\d{10}$/, format: 'XXX XXX XXXX' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria', pattern: /^[789]\d{9}$/, format: 'XXX XXX XXXX' },
];

interface WhatsAppConnectionProps {
  accessToken: string;
  onConnectionChange?: (connected: boolean) => void;
}

export function WhatsAppConnection({ accessToken, onConnectionChange }: WhatsAppConnectionProps) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [step, setStep] = useState<'input' | 'verify' | 'connected'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [isTestingMessage, setIsTestingMessage] = useState(false);

  // Load existing connection status
  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-333e8892/whatsapp/status`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.connected && data.verified) {
          setConnectionStatus(data);
          setStep('connected');
          onConnectionChange?.(true);
        }
      }
    } catch (err) {
      console.error('Failed to load connection status:', err);
    }
  };

  const validatePhoneNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/\D/g, '');
    
    if (!cleanNumber) {
      setError('Please enter a phone number');
      return false;
    }

    if (!selectedCountry.pattern.test(cleanNumber)) {
      setError(`Invalid ${selectedCountry.name} phone number format. Expected: ${selectedCountry.format}`);
      return false;
    }

    setError('');
    return true;
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format based on country
    if (selectedCountry.code === '+1') {
      // US/Canada format: (XXX) XXX-XXXX
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    
    // For other countries, just group digits
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSendVerification = async () => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (!validatePhoneNumber(cleanNumber)) {
      return;
    }

    const fullNumber = `${selectedCountry.code}${cleanNumber}`;
    
    setIsLoading(true);
    setError('');

    try {
      // Use new Supabase Edge Function
      const { sendWhatsAppVerification } = await import('../utils/whatsappVerification');
      
      // Get user ID from localStorage or accessToken JWT
      const userStr = localStorage.getItem('subtrack_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 'demo-user';
      
      // Show loading toast
      toast.loading('Sending verification code via WhatsApp...', { id: 'whatsapp-send' });
      
      const result = await sendWhatsAppVerification(fullNumber, userId, accessToken);

      if (!result.success) {
        toast.dismiss('whatsapp-send');
        throw new Error(result.error || 'Failed to send verification code');
      }

      setVerificationId(result.messageId || 'sent');
      setStep('verify');
      
      // Dismiss loading and show success
      toast.dismiss('whatsapp-send');
      toast.success(`✅ Verification code sent to WhatsApp!\nCheck ${fullNumber} for your 6-digit code.`, {
        duration: 5000,
      });
    } catch (err: any) {
      console.error('Verification send error:', err);
      toast.dismiss('whatsapp-send');
      
      // Parse error message for better display
      let errorMessage = err.message || 'Failed to send verification code';
      
      // Check for specific error types
      if (errorMessage.includes('credentials not configured')) {
        errorMessage = '⚠️ WhatsApp is not configured yet.\nPlease contact support to set up WhatsApp Business API.';
      } else if (errorMessage.includes('Invalid phone number')) {
        errorMessage = '❌ Invalid phone number format.\nPlease include your country code (e.g., +1 for US).';
      } else if (errorMessage.includes('recipient')) {
        errorMessage = '❌ Unable to send WhatsApp message.\n\nPlease verify:\n• Phone number is correct\n• WhatsApp is installed on this number\n• You haven\'t blocked our account';
      } else if (errorMessage.includes('Edge Functions not deployed')) {
        errorMessage = '⚠️ WhatsApp service not available.\nPlease try again later or contact support.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage, { duration: 8000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use new Supabase Edge Function
      const { verifyWhatsAppCode } = await import('../utils/whatsappVerification');
      
      // Get user ID from localStorage
      const userStr = localStorage.getItem('subtrack_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 'demo-user';
      
      const fullNumber = `${selectedCountry.code}${phoneNumber.replace(/\D/g, '')}`;
      
      const result = await verifyWhatsAppCode(
        fullNumber,
        verificationCode,
        userId,
        accessToken
      );

      if (!result.success) {
        throw new Error(result.error || 'Invalid verification code');
      }

      // Set connection status
      setConnectionStatus({
        phoneNumber: result.phoneNumber,
        verified: true,
        verifiedAt: new Date().toISOString(),
        connected: true,
      });
      
      setStep('connected');
      onConnectionChange?.(true);
      toast.success('WhatsApp connected and verified!');
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Invalid verification code');
      toast.error(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setVerificationCode('');
    setError('');
    await handleSendVerification();
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect WhatsApp? You will need to verify again to reconnect.')) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-333e8892/whatsapp/disconnect`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      setConnectionStatus(null);
      setStep('input');
      setPhoneNumber('');
      setVerificationCode('');
      setVerificationId('');
      onConnectionChange?.(false);
      toast.success('WhatsApp disconnected successfully');
    } catch (err: any) {
      console.error('Disconnect error:', err);
      toast.error(err.message || 'Failed to disconnect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestMessage = async () => {
    setIsTestingMessage(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-333e8892/whatsapp/test`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test message');
      }

      toast.success('Test message sent! Check your WhatsApp.');
    } catch (err: any) {
      console.error('Test message error:', err);
      toast.error(err.message || 'Failed to send test message');
    } finally {
      setIsTestingMessage(false);
    }
  };

  if (step === 'connected' && connectionStatus) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  WhatsApp Connected & Verified
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {connectionStatus.phoneNumber}
                </p>
                {connectionStatus.verifiedAt && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Verified: {new Date(connectionStatus.verifiedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <Badge className="bg-green-600 dark:bg-green-700">
                Active
              </Badge>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button
            onClick={handleTestMessage}
            disabled={isTestingMessage}
            variant="outline"
            className="flex-1"
          >
            {isTestingMessage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Message
              </>
            )}
          </Button>
          <Button
            onClick={handleDisconnect}
            disabled={isLoading}
            variant="outline"
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Disconnect
          </Button>
        </div>

        {connectionStatus.lastMessageAt && (
          <p className="text-xs text-muted-foreground">
            Last message sent: {new Date(connectionStatus.lastMessageAt).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="space-y-4">
        <Alert>
          <Phone className="h-4 w-4" />
          <AlertDescription>
            We've sent a 6-digit verification code to{' '}
            <strong>{selectedCountry.code}{phoneNumber}</strong>.
            Please check your WhatsApp messages.
          </AlertDescription>
        </Alert>

        <div>
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setVerificationCode(value);
              setError('');
            }}
            className="text-center text-2xl tracking-widest"
            autoFocus
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleVerifyCode}
            disabled={isLoading || verificationCode.length !== 6}
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Verify & Connect
              </>
            )}
          </Button>
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button
            onClick={handleResendCode}
            disabled={isLoading}
            variant="link"
            size="sm"
            className="text-sm"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Resend Code
          </Button>
          <Button
            onClick={() => {
              setStep('input');
              setVerificationCode('');
              setVerificationId('');
              setError('');
            }}
            variant="link"
            size="sm"
            className="text-sm"
          >
            Change Number
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <Label htmlFor="country-code">Country</Label>
          <Select
            value={`${selectedCountry.country}-${selectedCountry.code}`}
            onValueChange={(value) => {
              const country = COUNTRY_CODES.find(
                (c) => `${c.country}-${c.code}` === value
              );
              if (country) {
                setSelectedCountry(country);
                setPhoneNumber('');
                setError('');
              }
            }}
          >
            <SelectTrigger id="country-code">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span>{selectedCountry.code}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {COUNTRY_CODES.map((country) => (
                <SelectItem
                  key={`${country.country}-${country.code}`}
                  value={`${country.country}-${country.code}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1">{country.name}</span>
                    <span className="text-muted-foreground">{country.code}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label htmlFor="phone-number">Phone Number</Label>
          <Input
            id="phone-number"
            type="tel"
            placeholder={selectedCountry.format.replace(/X/g, '0')}
            value={phoneNumber}
            onChange={handlePhoneChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSendVerification();
              }
            }}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Format: {selectedCountry.flag} {selectedCountry.code} {selectedCountry.format}
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleSendVerification}
        disabled={isLoading || !phoneNumber}
        className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Verification...
          </>
        ) : (
          <>
            <Phone className="mr-2 h-4 w-4" />
            Connect WhatsApp
          </>
        )}
      </Button>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-900 dark:text-blue-100">
          <strong>Note:</strong> You'll receive a 6-digit verification code via WhatsApp to confirm ownership of this number.
        </p>
      </div>
    </div>
  );
}