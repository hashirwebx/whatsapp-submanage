import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { checkAccountExists } from '../utils/api';

interface EmailCheckerProps {
  email: string;
  isSignUp: boolean;
  onAccountCheck?: (exists: boolean | null) => void;
}

export function EmailChecker({ email, isSignUp, onAccountCheck }: EmailCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [accountExists, setAccountExists] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only check if email is valid format and user has stopped typing
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setAccountExists(null);
      setError('');
      onAccountCheck?.(null);
      return;
    }

    // Debounce the check
    const timeoutId = setTimeout(async () => {
      setChecking(true);
      setError('');

      try {
        const result = await checkAccountExists(email);

        if (result.error) {
          setError('Unable to verify account status');
          setAccountExists(null);
          onAccountCheck?.(null);
        } else {
          setAccountExists(result.exists);
          onAccountCheck?.(result.exists);
        }
      } catch (err: any) {
        setError('Unable to verify account status');
        setAccountExists(null);
        onAccountCheck?.(null);
      } finally {
        setChecking(false);
      }
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [email, onAccountCheck]);

  // Don't show anything if we haven't checked yet or email is invalid
  if (accountExists === null && !checking && !error) {
    return null;
  }

  // Determine the message based on sign-up mode and account existence
  const getMessage = () => {
    if (error) {
      return {
        icon: <AlertCircle size={16} className="flex-shrink-0" />,
        text: error,
        className: 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300',
      };
    }

    if (checking) {
      return {
        icon: <Loader2 size={16} className="animate-spin flex-shrink-0" />,
        text: 'Checking account...',
        className: 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-200',
      };
    }

    if (isSignUp) {
      // Sign Up mode
      if (accountExists) {
        return {
          icon: <XCircle size={16} className="flex-shrink-0" />,
          text: 'This email already has an account. Please use "Sign In" instead.',
          className: 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-600 text-red-800 dark:text-red-200',
        };
      } else {
        return {
          icon: <CheckCircle2 size={16} className="flex-shrink-0" />,
          text: 'Email available! You can create an account.',
          className: 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-600 text-green-800 dark:text-green-200',
        };
      }
    } else {
      // Sign In mode
      if (accountExists) {
        return {
          icon: <CheckCircle2 size={16} className="flex-shrink-0" />,
          text: 'Account found! Please enter your password.',
          className: 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-600 text-green-800 dark:text-green-200',
        };
      } else {
        return {
          icon: <XCircle size={16} className="flex-shrink-0" />,
          text: 'No account found with this email. Please use "Sign Up" to create an account.',
          className: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200',
        };
      }
    }
  };

  const message = getMessage();

  return (
    <div className={`flex items-start gap-2 p-3 border rounded-lg text-sm ${message.className}`}>
      {message.icon}
      <span>{message.text}</span>
    </div>
  );
}