import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, X, Key, Eye, EyeOff, Copy } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface OwnerAccessProps {
  onClose: () => void;
  onLogin: (userData: any) => void;
}

// Sample data for demo mode
const DEMO_USER_DATA = {
  id: 'demo-user-id',
  name: 'Demo User',
  email: 'demo@subtrack.com',
  isDemo: true,
  accessToken: 'demo-token-readonly',
};

export function OwnerAccess({ onClose, onLogin }: OwnerAccessProps) {
  const [showPassword, setShowPassword] = useState(true);

  // Display credentials (for user information)
  const credentials = {
    info: 'Click "Access Demo" to explore',
    note: 'Read-only preview mode'
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      // Fallback for environments blocking Clipboard API
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          toast.success(`${label} copied to clipboard`);
        } else {
          throw new Error('Fallback failed');
        }
      } catch (fallbackErr) {
        console.warn('Clipboard copy failed:', fallbackErr);
        toast.info(`Please manually copy the ${label.toLowerCase()}`);
      }
    }
  };

  const handleAccessDemo = () => {
    toast.success('Welcome to Demo Mode!');

    // Login with mock demo data (no real authentication)
    setTimeout(() => {
      onLogin(DEMO_USER_DATA);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-[#202124] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="relative bg-[#225E56] px-6 py-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield size={120} />
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4 shadow-xl">
              <Key className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold">Demo Access</h2>
            <p className="text-green-100 mt-2 text-sm max-w-xs">
              Explore SubTrack Pro with sample data in read-only mode
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4 flex items-start gap-3">
            <Shield className="text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Read-Only Preview</p>
              <p>
                You can view all features and sample data, but cannot create, edit, or delete anything.
                All changes are temporary and will not be saved.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-4">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-2">
              What you can do:
            </p>
            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>✓ Navigate through all pages</li>
              <li>✓ View sample subscriptions</li>
              <li>✓ Explore dashboard and analytics</li>
              <li>✓ See how features work</li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4">
            <p className="text-xs text-red-800 dark:text-red-200 font-medium mb-2">
              What you CANNOT do:
            </p>
            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
              <li>✗ Add new subscriptions</li>
              <li>✗ Edit or delete data</li>
              <li>✗ Send real notifications</li>
              <li>✗ Save any changes</li>
            </ul>
          </div>

          <button
            onClick={handleAccessDemo}
            className="w-full bg-[#225E56] hover:bg-[#1b4b45] text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-[#225E56]/20 flex items-center justify-center gap-2"
          >
            <Shield size={20} />
            Access Demo Preview
          </button>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            To unlock all features, create a real account with Sign Up
          </p>
        </div>
      </motion.div>
    </div>
  );
}
