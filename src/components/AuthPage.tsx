import React, { useState, useEffect } from 'react';
import { MessageSquare, Shield, Globe, Bell, Loader2, ArrowLeft, Home, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
import signVideo from './sign.mp4';

// ... (existing code)


import { signUp, signIn } from '../utils/api';
import { AuthHelp } from './AuthHelp';
import { AuthStatus } from './AuthStatus';
import { AccountRecovery } from './AccountRecovery';
import { CircularErrorDetector } from './CircularErrorDetector';
import { EmailChecker } from './EmailChecker';
// import { ThemeToggle } from './ThemeToggle'; // Removed
import { OwnerAccess } from './OwnerAccess';
import { motion, AnimatePresence } from 'motion/react';

interface AuthPageProps {
  onLogin: (userData: any) => void;
  onBackToHome?: () => void;
}

export function AuthPage({ onLogin, onBackToHome }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [showOwnerAccess, setShowOwnerAccess] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [accountExists, setAccountExists] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  // Reset state when switching modes
  useEffect(() => {
    setError('');
    setSuccess('');
    // We don't reset form data to allow users to switch easily without re-typing email
  }, [isSignUp]);

  const handleAccountCheck = (exists: boolean | null) => {
    setAccountExists(exists);
    // Clear errors when account status changes to avoid stale validation messages
    if (error && ((exists && isSignUp) || (!exists && !isSignUp))) {
      // logic handled in render or submit
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation based on account existence
    if (accountExists !== null && formData.email) {
      if (accountExists && isSignUp) {
        setError('An account with this email already exists. Please sign in instead.');
        setIsLoading(false);
        return;
      }
      if (!accountExists && !isSignUp) {
        setError('No account found with this email. Please create an account.');
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        setSuccess('Creating your account...');
        const response = await signUp(
          formData.email,
          formData.password,
          formData.name,
          formData.phone
        );

        if (response.success) {
          setSuccess('Account created successfully!');
          const userData = {
            ...response.user,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            accessToken: response.session.access_token,
          };

          setTimeout(() => {
            onLogin(userData);
          }, 800);
        }
      } else {
        const response = await signIn(formData.email, formData.password);

        if (response.success) {
          setSuccess('Signed in successfully!');
          const userData = {
            ...response.user,
            name: response.user.user_metadata?.name || response.user.email?.split('@')[0],
            email: response.user.email,
            phone: response.user.user_metadata?.phone || '',
            accessToken: response.session.access_token,
          };

          setTimeout(() => {
            onLogin(userData);
          }, 500);
        }
      }
    } catch (err: any) {
      console.log('Auth failed:', err.message);
      const errorMessage = err.message || 'Authentication failed. Please try again.';
      setError(errorMessage);
      setSuccess('');

      if (formData.email) {
        setRecoveryEmail(formData.email);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    setShowOwnerAccess(true);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row dark:bg-black">
      {/* Left Panel - Visuals & Branding */}
      <div className="lg:w-1/2 relative overflow-hidden hidden lg:flex flex-col justify-between p-12 text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={signVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-gray-900/90 mix-blend-multiply" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <MessageSquare className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight">SubTrack Pro</span>
          </div>

          <div className="space-y-8 max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Master your subscriptions with WhatsApp
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              The intelligent subscription tracker that lives in your chat app.
              Secure, simple, and always there when you need it.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 mt-12">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Bell size={20} className="text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Smart Alerts</h3>
              <p className="text-xs text-gray-400 mt-1">Never miss a payment</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Globe size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Global Support</h3>
              <p className="text-xs text-gray-400 mt-1">Multi-currency & languages</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Shield size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Enterprise Security</h3>
              <p className="text-xs text-gray-400 mt-1">End-to-end encryption</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-500 mt-12">
          © {new Date().getFullYear()} SubTrack Pro. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="lg:w-1/2 w-full flex flex-col justify-center items-center p-6 sm:p-12 relative">
        {/* Theme toggle removed */}

        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="absolute top-6 left-6 lg:left-12 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        )}

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <MessageSquare className="text-white" size={28} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isSignUp
                ? 'Start managing your subscriptions in seconds.'
                : 'Please enter your details to sign in.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${!isSignUp
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isSignUp
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                      placeholder="John Doe"
                      required={isSignUp}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 transition-all outline-none ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-green-500/20 focus:border-green-500'
                    }`}
                  placeholder="name@company.com"
                  required
                />
                {/* Email check indicator could go here */}
              </div>
              {formData.email && (
                <div className="mt-1">
                  <EmailChecker email={formData.email} isSignUp={isSignUp} onAccountCheck={handleAccountCheck} />
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                      placeholder="+1 234 567 8900"
                      required={isSignUp}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
                {isSignUp && <span className="ml-1 text-xs font-normal text-gray-500">(min. 6 chars)</span>}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            {/* Error & Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="text-red-600 dark:text-red-400 shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    {/* Contextual actions based on error */}
                    {formData.email && (
                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryEmail(formData.email);
                          setShowRecovery(true);
                        }}
                        className="text-xs font-medium text-red-700 dark:text-red-400 mt-2 hover:underline"
                      >
                        Trouble signing in? Recover account
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3"
                >
                  <CheckCircle2 className="text-green-600 dark:text-green-400 shrink-0" size={20} />
                  <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Account Existence Warnings/Prompts */}
            {accountExists !== null && !error && formData.email && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm"
              >
                {accountExists && isSignUp && (
                  <div className="text-orange-600 dark:text-orange-400 flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>Account exists. <button type="button" onClick={() => setIsSignUp(false)} className="underline font-medium">Switch to Sign In</button></span>
                  </div>
                )}
                {!accountExists && !isSignUp && (
                  <div className="text-orange-600 dark:text-orange-400 flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>No account found. <button type="button" onClick={() => setIsSignUp(true)} className="underline font-medium">Create one now</button></span>
                  </div>
                )}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading || (accountExists !== null && formData.email && ((accountExists && isSignUp) || (!accountExists && !isSignUp)))}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Footer Actions */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoMode}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>🎭</span> Try Demo Mode
            </button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        {/* Hidden but functional components */}
        <div className="hidden">
          <AuthStatus showByDefault={false} />
          {error && formData.email && (
            <CircularErrorDetector
              error={error}
              email={formData.email}
              isSignUp={isSignUp}
              onUseNewEmail={() => {
                setFormData({ ...formData, email: '', password: '' });
                setError('');
                setSuccess('');
              }}
              onDemoMode={handleDemoMode}
              onShowRecovery={() => {
                setRecoveryEmail(formData.email);
                setShowRecovery(true);
              }}
              onClearSession={() => {
                localStorage.clear();
                window.location.reload();
              }}
            />
          )}
        </div>
      </div>

      {/* Account Recovery Modal */}
      {showRecovery && (
        <AccountRecovery
          email={recoveryEmail}
          onClose={() => setShowRecovery(false)}
        />
      )}

      {/* Owner Access Modal */}
      {showOwnerAccess && (
        <OwnerAccess
          onClose={() => setShowOwnerAccess(false)}
          onLogin={onLogin}
        />
      )}
    </div>
  );
}
