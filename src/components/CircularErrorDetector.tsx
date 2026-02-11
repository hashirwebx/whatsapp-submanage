import { AlertTriangle, Mail, Play, Wrench, RefreshCw } from 'lucide-react';

interface CircularErrorDetectorProps {
  error: string;
  email: string;
  isSignUp: boolean;
  onUseNewEmail: () => void;
  onDemoMode: () => void;
  onShowRecovery: () => void;
  onClearSession: () => void;
}

export function CircularErrorDetector({
  error,
  email,
  isSignUp,
  onUseNewEmail,
  onDemoMode,
  onShowRecovery,
  onClearSession,
}: CircularErrorDetectorProps) {
  // Detect if this is a circular error pattern
  const isCircularError = 
    (error.includes('already exists') && isSignUp) ||
    (error.includes('Invalid') && !isSignUp);

  if (!isCircularError) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl shadow-lg">
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle size={24} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5 animate-pulse" />
        <div>
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
            ⚠️ Circular Error Detected!
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            You're stuck in a loop. This usually means an account exists with <strong>{email}</strong> but you're using the wrong password.
          </p>
        </div>
      </div>

      <div className="mb-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-xs text-yellow-900 dark:text-yellow-100 mb-1">
          <strong>What's happening:</strong>
        </p>
        {isSignUp ? (
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            • You tried to sign up, but this email is already registered<br/>
            • This means you (or someone) already created an account<br/>
            • You need to either sign in with the correct password or use a different email
          </p>
        ) : (
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            • You tried to sign in but the password is incorrect<br/>
            • Or the account doesn't exist yet<br/>
            • You need to either use the correct password or create a new account
          </p>
        )}
      </div>

      <div className="mb-2">
        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          🎯 Quick Solutions (pick one):
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onUseNewEmail}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Mail size={18} />
          <div className="text-left">
            <div className="text-sm font-semibold">Use New Email</div>
            <div className="text-xs opacity-90">Quickest solution</div>
          </div>
        </button>

        <button
          type="button"
          onClick={onDemoMode}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Play size={18} />
          <div className="text-left">
            <div className="text-sm font-semibold">Try Demo Mode</div>
            <div className="text-xs opacity-90">No account needed</div>
          </div>
        </button>

        <button
          type="button"
          onClick={onShowRecovery}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Wrench size={18} />
          <div className="text-left">
            <div className="text-sm font-semibold">Get Help</div>
            <div className="text-xs opacity-90">Guided recovery</div>
          </div>
        </button>

        <button
          type="button"
          onClick={onClearSession}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <RefreshCw size={18} />
          <div className="text-left">
            <div className="text-sm font-semibold">Clear & Reset</div>
            <div className="text-xs opacity-90">Start fresh</div>
          </div>
        </button>
      </div>

      <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
        <p className="text-xs text-yellow-900 dark:text-yellow-100 text-center">
          💡 <strong>Recommended:</strong> Click "Use New Email" - it's the fastest way to get started!
        </p>
      </div>
    </div>
  );
}
