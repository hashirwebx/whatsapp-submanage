import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CreditCard,
  Calendar,
  PieChart,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  UserPlus,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useMemo } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { useSettings } from '../contexts/SettingsContext';
import { convertCurrency, formatCurrency } from '../utils/currencyConverter';
import { useFamily } from '../contexts/FamilyContext';

interface DashboardProps {
  user: any;
}

export function Dashboard({ user }: DashboardProps) {
  const { subscriptions, analytics, isLoading, isRefreshing, refreshData } = useSubscriptions();
  const { settings } = useSettings();
  const { receivedInvitations, acceptReceivedInvitation, cancelInvitation } = useFamily();

  const userCurrency = settings.currency || 'USD';

  // 1. Calculate Monthly & Yearly Totals
  const stats = useMemo(() => {
    const totalMonthly = subscriptions.reduce((sum: number, sub: any) => {
      if (sub.status !== 'active') return sum;
      const monthlyAmount = sub.billingCycle === 'monthly'
        ? sub.amount
        : sub.billingCycle === 'yearly'
          ? sub.amount / 12
          : sub.amount * 4.33;
      return sum + convertCurrency(monthlyAmount, sub.currency, userCurrency);
    }, 0);

    // Calculate potential savings (Switching monthly to yearly usually saves ~20%)
    const potentialYearlySavings = subscriptions
      .filter((sub: any) => sub.status === 'active' && sub.billingCycle === 'monthly')
      .reduce((sum: number, sub: any) => {
        const potentialMonthlySaving = sub.amount * 0.2; // Assume 20% saving on yearly
        return sum + convertCurrency(potentialMonthlySaving, sub.currency, userCurrency);
      }, 0);

    return {
      totalMonthly,
      totalYearly: totalMonthly * 12,
      activeSubscriptions: subscriptions.filter((s: any) => s.status === 'active').length,
      upcomingPayments: subscriptions.filter((sub: any) => {
        const daysUntil = Math.floor((new Date(sub.nextBilling).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil >= 0 && daysUntil <= 30;
      }).length,
      potentialSavings: potentialYearlySavings,
    };
  }, [subscriptions, userCurrency]);

  // 2. Calculate Category Breakdown
  const categorySpending = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    let total = 0;

    subscriptions.filter((sub: any) => sub.status === 'active').forEach((sub: any) => {
      const monthlyAmount = sub.billingCycle === 'monthly'
        ? sub.amount
        : sub.billingCycle === 'yearly'
          ? sub.amount / 12
          : sub.amount * 4.33;
      const convertedAmount = convertCurrency(monthlyAmount, sub.currency, userCurrency);

      categoryMap[sub.category] = (categoryMap[sub.category] || 0) + convertedAmount;
      total += convertedAmount;
    });

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount: parseFloat(amount.toFixed(2)),
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [subscriptions, userCurrency]);

  // 3. Upcoming Payments
  const upcomingPayments = useMemo(() => {
    return [...subscriptions]
      .filter((sub: any) => sub.status === 'active')
      .sort((a: any, b: any) => new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime())
      .slice(0, 3);
  }, [subscriptions]);

  // 4. Recent Subscriptions
  const recentSubscriptions = useMemo(() => {
    return [...subscriptions].slice(0, 4);
  }, [subscriptions]);

  // 5. Dynamic Insights
  const insights = useMemo(() => {
    const realInsights = [];

    // Annual Plan Opportunity
    const monthlySubs = subscriptions.filter(s => s.status === 'active' && s.billingCycle === 'monthly');
    if (monthlySubs.length > 0) {
      const topMonthly = monthlySubs.sort((a, b) => b.amount - a.amount)[0];
      realInsights.push({
        type: 'opportunity',
        title: 'Annual Plan Savings',
        description: `Switch ${topMonthly.name} to an annual plan to potentially save 20% per year.`,
        savings: topMonthly.amount * 0.2,
        icon: TrendingUp,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      });
    }

    // Duplicate Category Warning
    const categories = subscriptions.map(s => s.category);
    const duplicates = categories.filter((cat, index) => categories.indexOf(cat) !== index && cat !== 'Other');
    if (duplicates.length > 0) {
      realInsights.push({
        type: 'savings',
        title: 'Duplicate Categories',
        description: `You have multiple subscriptions in the "${duplicates[0]}" category. Consider consolidating.`,
        icon: TrendingDown,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      });
    }

    // High Spend Alert
    if (stats.totalMonthly > convertCurrency(100, 'USD', userCurrency)) {
      realInsights.push({
        type: 'warning',
        title: 'High Monthly Spend',
        description: 'Your monthly subscription spend has exceeded your baseline.',
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      });
    }

    // Default insight if empty
    if (realInsights.length === 0) {
      realInsights.push({
        type: 'info',
        title: 'All Good!',
        description: 'Your subscriptions are looking optimized. Keep tracking to find more savings.',
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      });
    }

    return realInsights;
  }, [subscriptions, stats.totalMonthly, userCurrency]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <Loader2 size={40} className="animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Complete overview of your subscription spending</p>
        </div>
        <Button
          onClick={refreshData}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Incoming Invitations Notification */}
      {receivedInvitations.length > 0 && (
        <div className="mb-8 space-y-4">
          {receivedInvitations.map((invitation) => (
            <div key={invitation.id} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      Family Group Invitation
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>{invitation.invitedByName}</strong> has invited you to join their family group as a <strong>{invitation.role}</strong>.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="default"
                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => acceptReceivedInvitation(invitation.token)}
                  >
                    <Check size={18} className="mr-2" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none border-green-200 text-green-700 hover:bg-green-100 dark:border-green-800 dark:text-green-300"
                    onClick={() => cancelInvitation(invitation.id)}
                  >
                    <X size={18} className="mr-2" />
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(stats.totalMonthly, userCurrency)}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatCurrency(stats.totalYearly, userCurrency)} per year
            </p>
            {userCurrency !== 'USD' && (
              <Badge variant="outline" className="text-xs mt-2">
                Converted to {userCurrency}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.activeSubscriptions}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Upcoming Payments</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.upcomingPayments}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              In next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Potential Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600 dark:text-green-400">{formatCurrency(stats.potentialSavings, userCurrency)}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Per month available
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Upcoming Payments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
            <CardDescription>Your next subscription renewals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayments.map((payment, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-3 sm:gap-0">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                      {payment.logo}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm sm:text-base truncate">{payment.name}</p>
                        <Badge variant="secondary" className="text-xs">{payment.category}</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Due {new Date(payment.nextBilling).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-semibold text-sm sm:text-base">{formatCurrency(payment.amount, payment.currency)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{payment.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Monthly breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categorySpending.map((cat, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs sm:text-sm truncate">{cat.category}</span>
                    <span className="text-xs sm:text-sm ml-2">{formatCurrency(cat.amount, userCurrency)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader>
          <CardTitle>AI-Powered Insights & Recommendations</CardTitle>
          <CardDescription>Smart suggestions to optimize your spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className={`p-3 sm:p-4 rounded-lg border-l-4 ${insight.bgColor} dark:opacity-90`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`${insight.color} mt-1 flex-shrink-0`} size={20} />
                    <div className="flex-1 min-w-0">
                      <h4 className="mb-1 text-sm sm:text-base">{insight.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">{insight.description}</p>
                      {insight.savings && (
                        <div className={`inline-flex items-center gap-1 text-xs sm:text-sm ${insight.color}`}>
                          <TrendingDown size={16} />
                          <span>Save {formatCurrency(insight.savings, 'USD')}/month</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>All Active Subscriptions</CardTitle>
          <CardDescription>Manage your recurring payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {recentSubscriptions.map((sub, index) => (
              <div key={index} className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:bg-gray-800 transition-all">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                    {sub.logo}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base truncate">{sub.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{sub.category}</p>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="font-semibold text-sm sm:text-base">{formatCurrency(sub.amount, sub.currency)}/{sub.currency === 'USD' ? 'mo' : 'mo'}</p>
                  <Badge variant="outline" className="text-xs mt-1">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}