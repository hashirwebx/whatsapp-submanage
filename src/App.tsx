import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Settings, CreditCard, MessageSquare, BarChart3, Menu, X, LogOut } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { SubscriptionManager } from './components/SubscriptionManager';
import { Analytics } from './components/Analytics';
import { FamilySharing } from './components/FamilySharing';
import { Settings as SettingsPage } from './components/Settings';
import { ChatInterface } from './components/ChatInterface';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WelcomeGuide } from './components/WelcomeGuide';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { BlogGrid } from './components/BlogGrid';
import { BlogDetail } from './components/BlogDetail';
import { ThemeToggle } from './components/ThemeToggle';
import { NotificationCenter } from './components/NotificationCenter';
import { AuthDebug } from './components/AuthDebug';
import { Sidebar } from './components/Sidebar';
import { AcceptInvite } from './components/AcceptInvite';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { FamilyProvider } from './contexts/FamilyContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/sonner';
import { checkSession } from './utils/api';

function AppContent() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'chat' | 'subscriptions' | 'analytics' | 'family' | 'settings'>('dashboard');
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [publicPage, setPublicPage] = useState<'landing' | 'blog-grid' | 'blog-detail'>('landing');
  const [blogDetailId, setBlogDetailId] = useState<string | null>(null);

  const handlePublicNavigation = (page: string, params?: any) => {
    if (page === 'landing' || page === 'blog-grid' || page === 'blog-detail') {
      setPublicPage(page as any);
      if (params?.id) {
        setBlogDetailId(params.id);
      }
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('subtrack_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('Restored user from localStorage:', {
            ...userData,
            accessToken: userData.accessToken ? userData.accessToken.substring(0, 20) + '...' : 'MISSING'
          });

          // For demo mode, just restore
          if (userData.isDemo) {
            setIsAuthenticated(true);
            setUser(userData);
            setAuthLoading(false);
            return;
          }

          // For real users, validate the session with Supabase
          if (userData.accessToken && userData.email) {
            const sessionCheck = await checkSession(userData.accessToken);

            if (sessionCheck.valid) {
              console.log('Session is valid, user authenticated');
              setIsAuthenticated(true);
              setUser(userData);
            } else {
              console.warn('Session expired or invalid, clearing localStorage');
              localStorage.removeItem('subtrack_user');
            }
          } else {
            console.warn('Invalid session data - missing accessToken, clearing localStorage');
            localStorage.removeItem('subtrack_user');
          }
        } else {
          console.log('No stored user session found');
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('subtrack_user');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Check for invitation token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('invite_token');
    if (token) {
      console.log('Detected invitation token in URL:', token);
      setInvitationToken(token);
    }
  }, []);

  const handleLogin = (userData: any) => {
    console.log('handleLogin called with userData:', {
      ...userData,
      accessToken: userData.accessToken ? userData.accessToken.substring(0, 20) + '...' : 'MISSING'
    });

    setIsAuthenticated(true);
    setUser(userData);

    // Store user data in localStorage for session persistence
    // Store both real users and demo users (including admin demo)
    localStorage.setItem('subtrack_user', JSON.stringify(userData));
    console.log('Stored user data in localStorage');

    // Show welcome guide for new users (skip for demo users)
    const hasSeenWelcome = localStorage.getItem('subtrack_welcome_seen');
    if (!hasSeenWelcome && !userData.isDemo) {
      setShowWelcome(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('dashboard');
    localStorage.removeItem('subtrack_user');
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-black dark:to-[#303134]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 dark:border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-[#F8F9FA]">Loading SubTrack Pro...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated and auth page not explicitly requested
  if (!isAuthenticated && !showAuthPage) {
    if (publicPage === 'blog-grid') {
      return (
        <BlogGrid
          onNavigate={handlePublicNavigation}
          onGetStarted={() => setShowAuthPage(true)}
          onSignIn={() => setShowAuthPage(true)}
        />
      );
    }
    if (publicPage === 'blog-detail') {
      return (
        <BlogDetail
          onNavigate={handlePublicNavigation}
          onGetStarted={() => setShowAuthPage(true)}
          onSignIn={() => setShowAuthPage(true)}
        />
      );
    }

    return (
      <LandingPage
        onGetStarted={() => setShowAuthPage(true)}
        onSignIn={() => setShowAuthPage(true)}
        onNavigate={handlePublicNavigation}
      />
    );
  }

  // Show auth page if requested
  if (!isAuthenticated && showAuthPage) {
    return <AuthPage onLogin={handleLogin} onBackToHome={() => setShowAuthPage(false)} />;
  }

  // Show Accept Invite page if token exists
  if (invitationToken) {
    return (
      <AcceptInvite
        token={invitationToken}
        user={user}
        onAccept={(invite) => {
          setInvitationToken(null);
          // If the invitation acceptance triggered a login/account creation, 
          // the user will be redirected to dashboard automatically
          if (!isAuthenticated) {
            setShowAuthPage(true);
          }
        }}
        onBack={() => setInvitationToken(null)}
      />
    );
  }

  const navigation = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'chat', icon: MessageSquare, label: 'WhatsApp Chat' },
    { id: 'subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'family', icon: Users, label: 'Family Sharing' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  // Add debug view in development (accessible via URL hash)
  const showDebug = window.location.hash === '#debug';

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-green-600 dark:bg-green-700 text-white flex-col">
        <div className="p-6 border-b border-green-500 dark:border-green-600">
          <h1 className="text-2xl font-bold">SubTrack Pro</h1>
          <p className="text-green-100 dark:text-green-200 text-sm">Smart Subscription Manager</p>
        </div>

        <nav className="flex-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${currentView === item.id
                  ? 'bg-white text-green-700 dark:text-green-100 dark:bg-green-900'
                  : 'text-white hover:bg-green-500 dark:hover:bg-green-600'
                  }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-green-500 dark:border-green-600">
          {user?.isDemo && (
            <div className="mb-4 px-3 py-2 bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950 rounded-lg text-sm">
              <p>🎭 Demo Mode</p>
              <p className="text-xs">Using sample data</p>
            </div>
          )}
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-white dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-100">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-green-100 dark:text-green-200 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <div className="mb-3 flex items-center gap-2">
            <NotificationCenter
              accessToken={user?.accessToken || ''}
              userId={user?.id || ''}
            />
            {/* <ThemeToggle /> */}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:bg-green-500 dark:hover:bg-green-600 transition-all font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile/Tablet Sidebar - Slide-in menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Sidebar */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white flex flex-col shadow-xl">
            <div className="p-6 border-b border-green-500 dark:border-green-600">
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl">SubTrack Pro</h1>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white">
                  <X size={24} />
                </button>
              </div>
              <p className="text-green-100 dark:text-green-200 text-sm">Smart Subscription Manager</p>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${currentView === item.id
                      ? 'bg-white dark:bg-green-900 text-green-700 dark:text-green-100'
                      : 'text-white hover:bg-green-500 dark:hover:bg-green-600'
                      }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-green-500 dark:border-green-600">
              {user?.isDemo && (
                <div className="mb-4 px-3 py-2 bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950 rounded-lg text-sm">
                  <p>🎭 Demo Mode</p>
                  <p className="text-xs">Using sample data</p>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 bg-white dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-100">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-green-100 dark:text-green-200 truncate">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <NotificationCenter
                  accessToken={user?.accessToken || ''}
                  userId={user?.id || ''}
                />
                {/* <ThemeToggle /> */}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:bg-green-500 dark:hover:bg-green-600 transition-all font-medium"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-[#3C4043] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-gray-700 dark:text-[#F8F9FA]"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl text-gray-900 dark:text-[#F8F9FA]">SubTrack Pro</h1>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>

        <SubscriptionProvider user={user}>
          <FamilyProvider user={user} onUserUpdate={handleLogin}>
            <SettingsProvider user={user}>
              {showDebug ? (
                <AuthDebug user={user} />
              ) : (
                <>
                  {currentView === 'dashboard' && <Dashboard user={user} />}
                  {currentView === 'chat' && <ChatInterface user={user} />}
                  {currentView === 'subscriptions' && <SubscriptionManager user={user} />}
                  {currentView === 'analytics' && <Analytics user={user} />}
                  {currentView === 'family' && <FamilySharing user={user} />}
                  {currentView === 'settings' && <SettingsPage user={user} />}
                </>
              )}
            </SettingsProvider>
          </FamilyProvider>
        </SubscriptionProvider>
      </main>

      {/* Welcome Guide */}
      <WelcomeGuide
        isOpen={showWelcome}
        onClose={() => {
          setShowWelcome(false);
          localStorage.setItem('subtrack_welcome_seen', 'true');
        }}
        userName={user?.name || 'there'}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}