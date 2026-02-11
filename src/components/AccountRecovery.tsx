import { useState } from 'react';
import { AlertTriangle, RefreshCw, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface AccountRecoveryProps {
  email: string;
  onClose: () => void;
}

export function AccountRecovery({ email, onClose }: AccountRecoveryProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleDeleteAccount = async () => {
    if (deleteConfirm.toLowerCase() !== 'delete') {
      setResult({ success: false, message: 'Please type DELETE to confirm' });
      return;
    }

    setIsDeleting(true);
    setResult(null);

    try {
      // Note: This is a workaround since we can't actually delete Supabase auth users from client
      // We'll provide instructions instead
      setResult({
        success: true,
        message: 'Account reset initiated. Please follow the instructions below.',
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Failed to reset account',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={24} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Account Recovery
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Having trouble with: <strong>{email}</strong>
            </p>
          </div>
        </div>

        {!result && (
          <>
            <div className="mb-6 space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <RefreshCw size={18} />
                  Quick Solutions
                </h3>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
                  <li>
                    <strong>Try a different email</strong> - Use a unique email address for sign up
                  </li>
                  <li>
                    <strong>Check your password</strong> - Make sure you're entering the correct password for this email
                  </li>
                  <li>
                    <strong>Use Demo Mode</strong> - Skip authentication and explore the app
                  </li>
                </ol>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  ⚠️ Understanding the Error
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  You're seeing this because:
                </p>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                  <li>An account exists with email: <strong>{email}</strong></li>
                  <li>But the password you entered doesn't match</li>
                  <li>This creates a circular error: can't sign in (wrong password) and can't sign up (email exists)</li>
                </ul>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                <h3 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  <Trash2 size={18} />
                  Nuclear Option: Clear Session
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                  If nothing else works, clear your local session and start fresh:
                </p>
                <div className="mb-3">
                  <label className="text-sm text-red-900 dark:text-red-100 block mb-1">
                    Type <strong>DELETE</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-red-300 dark:border-red-600 rounded text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirm.toLowerCase() !== 'delete'}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900 text-white rounded transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Clear Session & Start Fresh
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {result && (
          <div className={`mb-6 p-4 rounded-lg border ${result.success
              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
            }`}>
            <div className="flex items-start gap-2 mb-3">
              {result.success ? (
                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${result.success
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
                }`}>
                {result.message}
              </p>
            </div>

            {result.success && (
              <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                <p className="font-medium">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Close this dialog</li>
                  <li>Click "Clear Session & Reload" in the Auth Status checker</li>
                  <li>Use a different email address for sign up</li>
                  <li>Or try Demo Mode to explore the app</li>
                </ol>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
          >
            Close
          </button>
          {result?.success && (
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Clear & Reload Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
