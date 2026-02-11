import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, DollarSign, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { useSettings } from '../contexts/SettingsContext';
import { convertCurrency, formatCurrency } from '../utils/currencyConverter';

interface AnalyticsProps {
  user: any;
}

export function Analytics({ user }: AnalyticsProps) {
  const { subscriptions, analytics, isLoading, isRefreshing, refreshData } = useSubscriptions();
  const { settings } = useSettings();

  const userCurrency = settings.currency || 'USD';

  // Custom Tooltip for Charts that respects user currency
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {payload[0].name}: {formatCurrency(payload[0].value, userCurrency)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Format YAxis to show currency symbol
  const formatYAxis = (value: number) => {
    return formatCurrency(value, userCurrency);
  };
  // Helper to safely parse amount
  const parseAmount = (amount: any): number => {
    if (typeof amount === 'number') return amount;
    const cleaned = amount?.toString().replace(/[^0-9.]/g, '') || '0';
    return parseFloat(cleaned) || 0;
  };

  const preferredCurrency = userCurrency;

  // 1. Calculate Monthly & Yearly Totals
  const stats = useMemo(() => {
    const totalMonthly = subscriptions.reduce((sum: number, sub: any) => {
      if (sub.status !== 'active') return sum;
      const monthlyAmount = sub.billingCycle === 'monthly'
        ? parseAmount(sub.amount)
        : sub.billingCycle === 'yearly'
          ? parseAmount(sub.amount) / 12
          : parseAmount(sub.amount) * 4.33;
      return sum + convertCurrency(monthlyAmount, sub.originalCurrency || sub.currency, userCurrency);
    }, 0);

    return {
      totalMonthly,
      totalYearly: totalMonthly * 12,
      activeSubscriptions: subscriptions.filter((s: any) => s.status === 'active').length,
    };
  }, [subscriptions, userCurrency]);

  // Unified dynamic spending timeline (History + Projection)
  const spendingTimeline = useMemo(() => {
    if (subscriptions.length === 0) return [];

    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 1. Find the Earliest Start Date
    let earliestDate = new Date();
    subscriptions.forEach(sub => {
      const d = sub.startDate ? new Date(sub.startDate) : (sub.createdAt ? new Date(sub.createdAt) : new Date());
      if (d < earliestDate) earliestDate = d;
    });

    const startYear = earliestDate.getFullYear();
    const startMonth = earliestDate.getMonth();

    // Generate all months from Start to Today + 6 months
    const totalMonthsToShow = [];
    const monthsDiff = (currentYear - startYear) * 12 + (currentMonthIndex - startMonth);
    const startOffset = Math.min(Math.max(monthsDiff, 0), 12); // Up to 12 months history

    for (let i = -startOffset; i <= 6; i++) {
      const date = new Date(currentYear, currentMonthIndex + i, 1);
      totalMonthsToShow.push({
        name: monthNames[date.getMonth()],
        month: date.getMonth(),
        year: date.getFullYear(),
        isFuture: i > 0,
        isCurrent: i === 0,
        label: `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`
      });
    }

    // 2. Calculate spending for each month
    return totalMonthsToShow.map(target => {
      let smoothedTotal = 0;
      let actualTotal = 0;

      subscriptions.filter(s => s.status === 'active').forEach(sub => {
        const subStart = sub.startDate ? new Date(sub.startDate) : (sub.createdAt ? new Date(sub.createdAt) : new Date(0));
        const subStartYearMonth = subStart.getFullYear() * 100 + subStart.getMonth();
        const targetYearMonth = target.year * 100 + target.month;

        // Skip if subscription hasn't started yet
        if (subStartYearMonth > targetYearMonth) return;

        let amount = parseAmount(sub.amount);
        let monthlyEquivalent = amount;
        if (sub.billingCycle === 'yearly') monthlyEquivalent = amount / 12;
        if (sub.billingCycle === 'weekly') monthlyEquivalent = amount * 4.33;

        smoothedTotal += convertCurrency(monthlyEquivalent, sub.originalCurrency || sub.currency, userCurrency);

        // Actual cash flow logic
        if (sub.billingCycle === 'monthly') {
          actualTotal += convertCurrency(amount, sub.originalCurrency || sub.currency, userCurrency);
        } else if (sub.billingCycle === 'weekly') {
          actualTotal += convertCurrency(amount * 4.33, sub.originalCurrency || sub.currency, userCurrency);
        } else if (sub.billingCycle === 'yearly') {
          const nextBilling = new Date(sub.nextBilling);
          if (target.month === nextBilling.getMonth() && (target.year === nextBilling.getFullYear() || target.isFuture)) {
            actualTotal += convertCurrency(amount, sub.originalCurrency || sub.currency, userCurrency);
          }
        }
      });

      return {
        month: target.label,
        smoothedAmount: parseFloat(smoothedTotal.toFixed(2)),
        actualAmount: parseFloat(actualTotal.toFixed(2)),
        // Legacy support
        amount: parseFloat(smoothedTotal.toFixed(2)),
        isFuture: target.isFuture,
        isCurrent: target.isCurrent
      };
    });
  }, [subscriptions, userCurrency]);

  // Generate real AI insights from user's actual subscriptions
  const insights = useMemo(() => {
    const realInsights: any[] = [];

    if (subscriptions.length === 0) {
      return [{
        type: 'info',
        icon: Lightbulb,
        title: 'Get Started',
        description: 'Add your subscriptions to see personalized insights and savings opportunities',
        impact: 'Start tracking',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      }];
    }

    // Check for monthly subscriptions that could save with annual billing
    const monthlySubs = subscriptions.filter(sub =>
      sub.status === 'active' &&
      sub.billingCycle === 'monthly' &&
      Number(sub.amount) >= 10
    );

    if (monthlySubs.length > 0) {
      const topMonthlySub = monthlySubs.sort((a, b) => Number(b.amount) - Number(a.amount))[0];
      const yearlySavings = Number(topMonthlySub.amount) * 12 * 0.15;
      realInsights.push({
        type: 'opportunity',
        icon: Lightbulb,
        title: 'Annual Plan Savings',
        description: `Switch ${topMonthlySub.name} to annual billing (typically 15% discount)`,
        impact: `Save ~${formatCurrency(yearlySavings, userCurrency)}/year`,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      });
    }

    // Check for duplicate categories
    const categoryCount = new Map<string, { count: number; subs: any[] }>();
    subscriptions.forEach(sub => {
      if (sub.status === 'active' && sub.category !== 'Other') {
        const current = categoryCount.get(sub.category) || { count: 0, subs: [] };
        categoryCount.set(sub.category, { count: current.count + 1, subs: [...current.subs, sub] });
      }
    });

    categoryCount.forEach((data, category) => {
      if (data.count > 1) {
        const totalCost = data.subs.reduce((sum, sub) => {
          let monthly = Number(sub.amount);
          if (sub.billingCycle === 'yearly') monthly /= 12;
          if (sub.billingCycle === 'weekly') monthly *= 4;
          return sum + monthly;
        }, 0);
        const potentialSaving = totalCost * 0.5; // Assume 50% savings by consolidating

        realInsights.push({
          type: 'savings',
          icon: TrendingDown,
          title: 'Duplicate Services Detected',
          description: `You have ${data.count} ${category} subscriptions (${data.subs.map(s => s.name).join(', ')})`,
          impact: `Save up to ${formatCurrency(potentialSaving, userCurrency)}/month`,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
        });
      }
    });

    // Check for upcoming renewals in next 7 days
    const now = Date.now();
    const upcomingSoon = subscriptions.filter(sub => {
      if (sub.status !== 'active') return false;
      const daysUntil = Math.floor((new Date(sub.nextBilling).getTime() - now) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 7;
    });

    if (upcomingSoon.length > 0) {
      const totalDue = upcomingSoon.reduce((sum, sub) => sum + Number(sub.amount), 0);
      realInsights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Payments Due This Week',
        description: `${upcomingSoon.length} subscription${upcomingSoon.length > 1 ? 's' : ''} will be charged soon`,
        impact: `${formatCurrency(totalDue, userCurrency)} total`,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      });
    }

    // Calculate spending trend using timeline history
    const historyItems = spendingTimeline.filter((d: any) => !d.isFuture);
    if (historyItems.length >= 2) {
      const oldestAmount = historyItems[0].amount;
      const newestAmount = historyItems[historyItems.length - 1].amount;
      const percentChange = oldestAmount === 0 ? 0 : ((newestAmount - oldestAmount) / oldestAmount * 100).toFixed(1);
      const amountChange = Math.abs(newestAmount - oldestAmount);

      if (Math.abs(parseFloat(percentChange.toString())) > 5) {
        realInsights.push({
          type: 'trend',
          icon: parseFloat(percentChange.toString()) > 0 ? TrendingUp : TrendingDown,
          title: 'Spending Trend',
          description: `Your monthly spending ${parseFloat(percentChange.toString()) > 0 ? 'increased' : 'decreased'} by ${Math.abs(parseFloat(percentChange.toString()))}% since your first subscription`,
          impact: `${parseFloat(percentChange.toString()) > 0 ? '+' : '-'}${formatCurrency(amountChange, userCurrency)}/month`,
          color: parseFloat(percentChange.toString()) > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400',
          bgColor: parseFloat(percentChange.toString()) > 0 ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-green-50 dark:bg-green-900/20',
        });
      }
    }

    // Add generic insight if we have very few insights
    if (realInsights.length === 0) {
      realInsights.push({
        type: 'info',
        icon: Lightbulb,
        title: 'Looking Good!',
        description: 'No major optimization opportunities detected. Keep monitoring your subscriptions.',
        impact: 'Keep it up!',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      });
    }

    return realInsights;
  }, [subscriptions, spendingTimeline, userCurrency, preferredCurrency]);

  // Calculate real top subscriptions from user data
  const topSubscriptions = useMemo(() => {
    if (subscriptions.length === 0) return [];

    const currentTotalMonthly = stats.totalMonthly || 0;

    return subscriptions
      .filter(sub => sub.status === 'active')
      .map(sub => {
        let amount = parseAmount(sub.amount);
        let monthlyAmount = amount;
        if (sub.billingCycle === 'yearly') monthlyAmount = amount / 12;
        if (sub.billingCycle === 'weekly') monthlyAmount = amount * 4.33;

        const convertedAmount = convertCurrency(monthlyAmount, sub.originalCurrency || sub.currency, userCurrency);
        const percentage = currentTotalMonthly > 0 ? (convertedAmount / currentTotalMonthly) * 100 : 0;

        return {
          name: sub.name,
          amount: convertedAmount,
          percentage: parseFloat(percentage.toFixed(1)),
          logo: sub.logo || '📱',
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [subscriptions, stats.totalMonthly, userCurrency]);

  // Calculate real category data
  const categoryData = useMemo(() => {
    if (subscriptions.length === 0) return [];

    const categoryMap = new Map<string, number>();
    subscriptions.forEach(sub => {
      if (sub.status !== 'active') return;

      let amount = parseAmount(sub.amount);
      let monthlyAmount = amount;
      if (sub.billingCycle === 'yearly') monthlyAmount = amount / 12;
      if (sub.billingCycle === 'weekly') monthlyAmount = amount * 4.33;

      const convertedAmount = convertCurrency(monthlyAmount, sub.originalCurrency || sub.currency, userCurrency);
      const current = categoryMap.get(sub.category) || 0;
      categoryMap.set(sub.category, current + convertedAmount);
    });

    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#6b7280', '#ef4444', '#ec4899', '#06b6d4'];

    return Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value: parseFloat(value.toFixed(2)),
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [subscriptions, userCurrency]);

  // Calculate potential savings
  const potentialSavings = useMemo(() => {
    if (subscriptions.length === 0) return 0;

    let totalSavings = 0;

    // Annual plan savings (15% on monthly subs >= $10)
    subscriptions.forEach(sub => {
      if (sub.status === 'active' && sub.billingCycle === 'monthly' && parseAmount(sub.amount) >= 10) {
        const potentialSaving = parseAmount(sub.amount) * 0.15;
        totalSavings += convertCurrency(potentialSaving, sub.originalCurrency || sub.currency, userCurrency);
      }
    });

    // Duplicate category savings (estimate 50% of duplicates)
    const categoryCount = new Map<string, number>();
    subscriptions.forEach(sub => {
      if (sub.status === 'active' && sub.category !== 'Other') {
        let amount = parseAmount(sub.amount);
        let monthly = amount;
        if (sub.billingCycle === 'yearly') monthly /= 12;
        if (sub.billingCycle === 'weekly') monthly *= 4.33;

        const convertedMonthly = convertCurrency(monthly, sub.originalCurrency || sub.currency, userCurrency);
        const current = categoryCount.get(sub.category) || 0;
        if (current > 0) {
          totalSavings += convertedMonthly * 0.5; // 50% of duplicate cost
        }
        categoryCount.set(sub.category, current + convertedMonthly);
      }
    });

    return parseFloat(totalSavings.toFixed(2));
  }, [subscriptions, userCurrency]);

  // Calculate spending comparison
  const spendingComparison = useMemo(() => {
    const historyItems = spendingTimeline.filter((d: any) => !d.isFuture);
    if (historyItems.length < 2) return { change: 0, isIncrease: false };

    const previousMonth = historyItems[historyItems.length - 2].amount;
    const currentMonth = historyItems[historyItems.length - 1].amount;
    const change = currentMonth === 0 ? 0 : ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1);

    return {
      change: Math.abs(parseFloat(change.toString())),
      isIncrease: parseFloat(change.toString()) > 0,
    };
  }, [spendingTimeline]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalMonthly = stats.totalMonthly;
  const totalYearly = stats.totalYearly;
  const activeCount = stats.activeSubscriptions;

  // Show empty state if no subscriptions
  if (subscriptions.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Analytics & Insights</h1>
          <p className="text-muted-foreground">AI-powered spending analysis and cost optimization</p>
        </div>

        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <DollarSign size={64} className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl mb-3">No Data Yet</h2>
            <p className="text-muted-foreground mb-6">
              Add your subscriptions to see detailed analytics, spending trends, and personalized savings recommendations.
            </p>
            <Button onClick={refreshData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-2">Analytics & Insights</h1>
          <p className="text-muted-foreground">AI-powered spending analysis with real-time data</p>
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

      {/* Key Metrics - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl mb-1">{formatCurrency(totalMonthly, userCurrency)}</div>
            <div className={`flex items-center gap-1 text-sm ${spendingComparison.isIncrease ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
              {spendingComparison.isIncrease ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{spendingComparison.change}% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Yearly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl mb-1">{formatCurrency(totalYearly, userCurrency)}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar size={16} />
              <span>Annual projection</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Potential Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl mb-1 text-green-600 dark:text-green-400">{formatCurrency(potentialSavings, userCurrency)}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingDown size={16} />
              <span>Per month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl mb-1">{activeCount}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign size={16} />
              <span>Subscriptions</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid - Real Data */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
            <CardDescription>Historical monthly spending based on your active subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spendingTimeline.filter((d: any) => !d.isFuture)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={formatYAxis} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  content={<CustomTooltip />}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={2}
                  name={`Spending (${preferredCurrency})`}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown - Real Data */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Distribution of your {activeCount} active subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Subscriptions - Real Data */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Subscriptions by Cost</CardTitle>
          <CardDescription>Your {topSubscriptions.length} most expensive services</CardDescription>
        </CardHeader>
        <CardContent>
          {topSubscriptions.length > 0 ? (
            <div className="space-y-4">
              {topSubscriptions.map((sub, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl w-8">{sub.logo}</span>
                      <div className="flex-1">
                        <p className="font-medium">{sub.name}</p>
                        <p className="text-sm text-muted-foreground">{sub.percentage}% of total spending</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(sub.percentage * 5, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <p className="text-xl font-semibold">{formatCurrency(sub.amount, userCurrency)}</p>
                    <p className="text-sm text-muted-foreground">/month</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No subscriptions to display</p>
          )}
        </CardContent>
      </Card>

      {/* AI Insights - Real Data */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
          <CardDescription>Personalized recommendations based on your actual subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${insight.bgColor} border-l-current`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`${insight.color} mt-1 flex-shrink-0`} size={24} />
                    <div className="flex-1">
                      <h4 className="mb-1 font-semibold">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <Badge variant="secondary" className={`${insight.color} border-current`}>{insight.impact}</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Yearly Projection - Real Data */}
      <Card>
        <CardHeader>
          <CardTitle>6-Month Projection</CardTitle>
          <CardDescription>Predicted spending based on your current {activeCount} active subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendingTimeline.filter((d: any) => d.isFuture || d.isCurrent)}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={formatYAxis} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                content={<CustomTooltip />}
              />
              <Legend />
              <Bar
                dataKey="actualAmount"
                fill="#10b981"
                name={`Projected Cash Flow (${userCurrency})`}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}