import { AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface AuthHelpProps {
  errorMessage: string | null;
}

export function AuthHelp({ errorMessage }: AuthHelpProps) {
  if (!errorMessage) return null;

  // Check if error message contains bullet points (formatted with •)
  const hasFormattedSteps = errorMessage.includes('•') || errorMessage.includes('\\n\\n');
  
  if (hasFormattedSteps) {
    // Display formatted error message with preserved line breaks
    const lines = errorMessage.split('\\n').filter(line => line.trim());
    
    return (
      <Alert className="border-2 border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
          Quick Help
        </AlertTitle>
        <AlertDescription className="mt-2 text-yellow-800 dark:text-yellow-200">
          <div className="space-y-2">
            {lines.map((line, index) => (
              <p key={index} className="text-sm whitespace-pre-wrap">
                {line}
              </p>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Determine the type of error and provide specific help
  const getHelpContent = (error: string) => {
    const lowerError = error.toLowerCase();

    // Invalid credentials
    if (lowerError.includes('invalid') && (lowerError.includes('credentials') || lowerError.includes('password'))) {
      return {
        title: 'Login Failed',
        suggestions: [
          'Make sure you have created an account first - click "Sign Up" if you\'re new',
          'Verify your email address is spelled correctly',
          'Check that your password is correct (passwords are case-sensitive)',
          'Try using Demo Mode to verify the app is working',
        ],
      };
    }

    // Email confirmation
    if (lowerError.includes('email') && lowerError.includes('confirm')) {
      return {
        title: 'Email Not Confirmed',
        suggestions: [
          'Check your email inbox for a confirmation link',
          'Look in your spam/junk folder if you don\'t see it',
          'Wait a few moments and try signing in again',
          'Contact support if the issue persists',
        ],
      };
    }

    // Password too short
    if (lowerError.includes('password') && (lowerError.includes('characters') || lowerError.includes('long'))) {
      return {
        title: 'Password Requirements',
        suggestions: [
          'Use at least 6 characters in your password',
          'We recommend 8+ characters for better security',
          'Include a mix of letters, numbers, and symbols',
          'Example: MySecurePass123!',
        ],
      };
    }

    // Already registered
    if (lowerError.includes('already registered') || lowerError.includes('already been registered')) {
      return {
        title: 'Account Already Exists',
        suggestions: [
          'This email is already registered',
          'Click "Sign In" instead of "Sign Up"',
          'Use the "Forgot Password" option if you can\'t remember your password',
          'Or try a different email address to create a new account',
        ],
      };
    }

    // Session failed
    if (lowerError.includes('session')) {
      return {
        title: 'Session Error',
        suggestions: [
          'This is usually a temporary issue',
          'Try signing in again',
          'Clear your browser cache and cookies',
          'Try using an incognito/private browser window',
        ],
      };
    }

    // Network/connection errors
    if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection')) {
      return {
        title: 'Connection Error',
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Wait a moment and try again',
          'Check if other websites are loading',
        ],
      };
    }

    // Generic error
    return {
      title: 'Authentication Error',
      suggestions: [
        'Try refreshing the page',
        'Clear your browser cache and cookies',
        'Try Demo Mode to verify the app is working',
        'Contact support if the issue continues',
      ],
    };
  };

  const helpContent = getHelpContent(errorMessage);

  return (
    <Alert variant="destructive" className="border-2">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {helpContent.title}
        <HelpCircle size={16} className="text-muted-foreground" />
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Error:</strong> {errorMessage}
          </p>
          <p className="text-sm font-semibold mt-3">What you can try:</p>
          <ul className="space-y-1.5">
            {helpContent.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Add <code className="bg-muted px-1 rounded">#debug</code> to the URL to check your authentication status
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}