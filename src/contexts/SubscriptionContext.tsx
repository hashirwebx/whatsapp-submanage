import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSubscriptions, getAnalytics, addSubscription, updateSubscription, deleteSubscription } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  originalCurrency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly';
  nextBilling: string;
  startDate?: string | null;
  category: string;
  status: 'active' | 'paused' | 'cancelled';
  logo: string;
  paymentMethod: string;
  bank?: string | null;
  websiteUrl?: string | null;
  website?: string; // Legacy field
  description?: string | null;
  reminderSettings?: {
    daysBeforePayment: number;
    reminderTime: string;
  };
  createdAt?: string;
}

export interface Analytics {
  totalMonthly: number;
  totalYearly: number;
  activeSubscriptions: number;
  upcomingPayments: number;
  categoryBreakdown?: any[];
  monthlyTrend?: any[];
}

interface SubscriptionContextType {
  // Data
  subscriptions: Subscription[];
  analytics: Analytics | null;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Actions
  refreshData: () => Promise<void>;
  addNewSubscription: (data: any) => Promise<boolean>;
  updateExistingSubscription: (id: string, updates: any) => Promise<boolean>;
  deleteExistingSubscription: (id: string) => Promise<boolean>;

  // Error state
  error: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Demo data for demo mode
const getDemoSubscriptions = (): Subscription[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Helper to create date X months ago
  const monthsAgo = (months: number) => {
    const date = new Date(currentYear, currentMonth - months, 15); // 15th of the month
    return date.toISOString();
  };

  return [
    {
      id: 'demo-1',
      name: 'Netflix',
      amount: 15.99,
      currency: 'USD',
      originalCurrency: 'USD',
      billingCycle: 'monthly',
      nextBilling: new Date(currentYear, currentMonth + 1, 5).toISOString().split('T')[0],
      category: 'Entertainment',
      status: 'active',
      logo: '🎬',
      paymentMethod: 'Visa ****4242',
      createdAt: monthsAgo(5), // 5 months ago
    },
    {
      id: 'demo-2',
      name: 'Spotify',
      amount: 9.99,
      currency: 'USD',
      originalCurrency: 'USD',
      billingCycle: 'monthly',
      nextBilling: new Date(currentYear, currentMonth + 1, 8).toISOString().split('T')[0],
      category: 'Music',
      status: 'active',
      logo: '🎵',
      paymentMethod: 'Mastercard ****5555',
      createdAt: monthsAgo(4), // 4 months ago
    },
    {
      id: 'demo-3',
      name: 'Adobe Creative Cloud',
      amount: 54.99,
      currency: 'USD',
      originalCurrency: 'USD',
      billingCycle: 'monthly',
      nextBilling: new Date(currentYear, currentMonth + 1, 12).toISOString().split('T')[0],
      category: 'Software',
      status: 'active',
      logo: '🎨',
      paymentMethod: 'Visa ****4242',
      createdAt: monthsAgo(6), // 6 months ago
    },
    {
      id: 'demo-4',
      name: 'ChatGPT Plus',
      amount: 20.00,
      currency: 'USD',
      originalCurrency: 'USD',
      billingCycle: 'monthly',
      nextBilling: new Date(currentYear, currentMonth + 1, 1).toISOString().split('T')[0],
      category: 'AI Tools',
      status: 'active',
      logo: '🤖',
      paymentMethod: 'Amex ****1234',
      createdAt: monthsAgo(2), // 2 months ago
    },
    {
      id: 'demo-5',
      name: 'GitHub Pro',
      amount: 7.00,
      currency: 'USD',
      originalCurrency: 'USD',
      billingCycle: 'monthly',
      nextBilling: new Date(currentYear, currentMonth + 1, 20).toISOString().split('T')[0],
      category: 'Development',
      status: 'active',
      logo: '💻',
      paymentMethod: 'Visa ****4242',
      createdAt: monthsAgo(3), // 3 months ago
    },
    {
      id: 'demo-6',
      name: 'Dropbox Plus',
      amount: 11.99,
      currency: 'USD',
      originalCurrency: 'USD',
      billingCycle: 'monthly',
      nextBilling: new Date(currentYear, currentMonth + 1, 25).toISOString().split('T')[0],
      category: 'Storage',
      status: 'active',
      logo: '☁️',
      paymentMethod: 'Mastercard ****5555',
      createdAt: monthsAgo(1), // 1 month ago
    },
    {
      id: 'demo-7',
      name: 'Notion',
      amount: 10.00,
      currency: 'USD',
      originalCurrency: 'USD',
      billingCycle: 'monthly',
      nextBilling: new Date(currentYear, currentMonth + 1, 15).toISOString().split('T')[0],
      category: 'Productivity',
      status: 'active',
      logo: '📝',
      paymentMethod: 'Visa ****4242',
      createdAt: monthsAgo(0), // This month (current)
    },
    {
      id: 'demo-8',
      name: 'Microsoft 365',
      amount: 39.99,
      currency: 'USD',
      originalCurrency: 'USD',
      billingCycle: 'monthly',
      nextBilling: new Date(currentYear, currentMonth + 1, 18).toISOString().split('T')[0],
      category: 'Software',
      status: 'active',
      logo: '📊',
      paymentMethod: 'Amex ****1234',
      createdAt: monthsAgo(5), // 5 months ago
    },
  ];
};

const getDemoAnalytics = (): Analytics => {
  const subs = getDemoSubscriptions();
  const totalMonthly = subs.reduce((sum, sub) => {
    if (sub.billingCycle === 'monthly') return sum + sub.amount;
    if (sub.billingCycle === 'yearly') return sum + (sub.amount / 12);
    if (sub.billingCycle === 'weekly') return sum + (sub.amount * 4);
    return sum;
  }, 0);

  return {
    totalMonthly: parseFloat(totalMonthly.toFixed(2)),
    totalYearly: parseFloat((totalMonthly * 12).toFixed(2)),
    activeSubscriptions: subs.filter(s => s.status === 'active').length,
    upcomingPayments: subs.filter(sub => {
      const daysUntil = Math.floor((new Date(sub.nextBilling).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 7;
    }).length,
  };
};

interface SubscriptionProviderProps {
  children: ReactNode;
  user: any;
}

export function SubscriptionProvider({ children, user }: SubscriptionProviderProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when user changes or on mount
  const loadData = useCallback(async (showLoader = true) => {
    if (!user) {
      console.log('SubscriptionContext: No user, skipping data load');
      setIsLoading(false);
      return;
    }

    // Handle demo mode
    if (user.isDemo) {
      console.log('SubscriptionContext: Demo mode, using demo data');
      setSubscriptions(getDemoSubscriptions());
      setAnalytics(getDemoAnalytics());
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    // Validate access token
    if (!user.accessToken) {
      console.error('SubscriptionContext: No access token available');
      setError('Session expired. Please log in again.');
      setIsLoading(false);
      setIsRefreshing(false);
      toast.error('Session expired. Please log in again.');
      localStorage.removeItem('subtrack_user');
      setTimeout(() => window.location.reload(), 2000);
      return;
    }

    console.log('SubscriptionContext: Loading data for authenticated user');

    if (showLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      // Fetch subscriptions and analytics in parallel
      const [subsResponse, analyticsResponse] = await Promise.all([
        getSubscriptions(user.accessToken),
        getAnalytics(user.accessToken),
      ]);

      console.log('SubscriptionContext: Data loaded successfully', {
        subscriptions: subsResponse.subscriptions?.length || 0,
        analytics: analyticsResponse.analytics,
      });

      setSubscriptions(subsResponse.subscriptions || []);
      setAnalytics(analyticsResponse.analytics || null);
    } catch (error: any) {
      console.error('SubscriptionContext: Failed to load data:', error);
      setError(error.message || 'Failed to load data');

      // Don't show error toast if it's just an empty state
      if (!error.message?.includes('No subscriptions found')) {
        toast.error('Failed to load subscription data');
      }

      // Set empty state instead of failing completely
      setSubscriptions([]);
      setAnalytics(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Refresh data (can be called manually)
  const refreshData = useCallback(async () => {
    console.log('SubscriptionContext: Manual refresh triggered');
    await loadData(false);
  }, [loadData]);

  // Add new subscription
  const addNewSubscription = useCallback(async (data: any): Promise<boolean> => {
    if (!user || user.isDemo) {
      toast.error('Cannot add subscriptions in demo mode. Please create an account.');
      return false;
    }

    if (!user.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      console.log('SubscriptionContext: Adding new subscription', data);

      // Ensure createdAt is set to current date/time if not provided
      const subscriptionData = {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        originalCurrency: data.originalCurrency || data.currency, // Ensure originalCurrency is set
      };

      const response = await addSubscription(user.accessToken, subscriptionData);

      if (response.success) {
        toast.success('Subscription added successfully!');
        // Refresh data to get updated list
        await refreshData();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('SubscriptionContext: Failed to add subscription:', error);
      toast.error('Failed to add subscription: ' + error.message);
      return false;
    }
  }, [user, refreshData]);

  // Update existing subscription
  const updateExistingSubscription = useCallback(async (id: string, updates: any): Promise<boolean> => {
    if (!user || user.isDemo) {
      toast.error('Cannot update subscriptions in demo mode. Please create an account.');
      return false;
    }

    if (!user.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      console.log('SubscriptionContext: Updating subscription', id, updates);
      await updateSubscription(user.accessToken, id, updates);
      toast.success('Subscription updated successfully!');

      // Refresh data to get updated list
      await refreshData();
      return true;
    } catch (error: any) {
      console.error('SubscriptionContext: Failed to update subscription:', error);
      toast.error('Failed to update subscription: ' + error.message);
      return false;
    }
  }, [user, refreshData]);

  // Delete subscription
  const deleteExistingSubscription = useCallback(async (id: string): Promise<boolean> => {
    if (!user || user.isDemo) {
      toast.error('Cannot delete subscriptions in demo mode. Please create an account.');
      return false;
    }

    if (!user.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      console.log('SubscriptionContext: Deleting subscription', id);
      await deleteSubscription(user.accessToken, id);
      toast.success('Subscription deleted successfully!');

      // Refresh data to get updated list
      await refreshData();
      return true;
    } catch (error: any) {
      console.error('SubscriptionContext: Failed to delete subscription:', error);
      toast.error('Failed to delete subscription: ' + error.message);
      return false;
    }
  }, [user, refreshData]);

  const value: SubscriptionContextType = {
    subscriptions,
    analytics,
    isLoading,
    isRefreshing,
    refreshData,
    addNewSubscription,
    updateExistingSubscription,
    deleteExistingSubscription,
    error,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// Custom hook to use the subscription context
export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
}