import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface AuthStatusProps {
  showByDefault?: boolean;
}

export function AuthStatus({ showByDefault = false }: AuthStatusProps) {
  const [isExpanded, setIsExpanded] = useState(showByDefault);
  
  // Check localStorage for existing auth
  const storedUser = localStorage.getItem('subtrack_user');
  let userData = null;
  
  try {
    userData = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error('Failed to parse stored user data:', e);
  }

  const hasStoredAuth = !!userData;
  const hasEmail = !!userData?.email;
  const hasToken = !!userData?.accessToken;
  const isDemo = !!userData?.isDemo;

  return (
    <div className="mt-6 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          🔍 Check Authentication Status
        </span>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              {hasStoredAuth ? (
                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  <strong>Stored User Data:</strong> {hasStoredAuth ? 'Found' : 'Not found'}
                </p>
                {!hasStoredAuth && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    No saved login session. You need to sign in or sign up.
                  </p>
                )}
              </div>
            </div>

            {hasStoredAuth && (
              <>
                <div className="flex items-start gap-2">
                  {hasEmail ? (
                    <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <strong>Email:</strong> {hasEmail ? userData.email : 'Missing'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  {hasToken ? (
                    <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <strong>Access Token:</strong> {hasToken ? 'Present' : 'Missing'}
                    </p>
                    {hasToken && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-mono">
                        {userData.accessToken.substring(0, 30)}...
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  {isDemo ? (
                    <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <strong>Mode:</strong> {isDemo ? 'Demo Mode' : 'Real Account'}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                <strong>What does this mean?</strong>
              </p>
              
              {!hasStoredAuth && (
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <p>❌ You are NOT signed in</p>
                  <p>➡️ Click <strong>"Sign Up"</strong> to create a new account</p>
                  <p>➡️ Or click <strong>"Try Demo Mode"</strong> to explore</p>
                </div>
              )}
              
              {hasStoredAuth && isDemo && (
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <p>🎭 You are in Demo Mode</p>
                  <p>➡️ Data is not saved</p>
                  <p>➡️ Create a real account to save your data</p>
                </div>
              )}
              
              {hasStoredAuth && !isDemo && hasToken && (
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <p>✅ You are signed in with email: <strong>{userData.email}</strong></p>
                  <p>➡️ Your session is active</p>
                  <p>➡️ Your data is saved to the database</p>
                </div>
              )}
              
              {hasStoredAuth && !isDemo && !hasToken && (
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <p>⚠️ Session data is incomplete</p>
                  <p>➡️ Click the button below to clear and try again</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => {
                  if (confirm('This will clear your stored session and reload the page. Continue?')) {
                    localStorage.removeItem('subtrack_user');
                    window.location.reload();
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              >
                Clear Session & Reload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
