import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, Plus } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { toast } from 'sonner@2.0.3';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
  data?: any;
}

interface ChatInterfaceProps {
  user: any;
}

export function ChatInterface({ user }: ChatInterfaceProps) {
  const { subscriptions, analytics, addNewSubscription, isLoading } = useSubscriptions();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: `👋 Hi ${user?.name || 'there'}! I'm SubTrack Pro, your intelligent subscription assistant. I can help you manage your subscriptions with real-time data.\n\nTry asking me:\n• "Show my subscriptions"\n• "Add a new subscription"\n• "What are my upcoming payments?"\n• "Show my spending analytics"`,
      timestamp: new Date(Date.now() - 60000),
      quickReplies: ['Show my subscriptions', 'Add Netflix $15.99', 'Upcoming payments', 'Spending analytics'],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSubData, setNewSubData] = useState({
    name: '',
    amount: '',
    currency: 'USD',
    billingCycle: 'monthly' as 'monthly' | 'yearly' | 'weekly',
    nextBilling: '',
    category: 'Other',
    paymentMethod: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Natural Language Understanding - Command Recognition
  const recognizeIntent = (input: string): { intent: string; entities: any } => {
    const lowerInput = input.toLowerCase().trim();

    // View Subscriptions
    if (
      lowerInput.includes('show') && lowerInput.includes('subscription') ||
      lowerInput.includes('view') && lowerInput.includes('subscription') ||
      lowerInput.includes('list') && lowerInput.includes('subscription') ||
      lowerInput.includes('what subscriptions') ||
      lowerInput.includes('my subscriptions') ||
      lowerInput === 'subscriptions'
    ) {
      return { intent: 'view_subscriptions', entities: {} };
    }

    // Add Subscription
    if (
      lowerInput.includes('add') && (lowerInput.includes('subscription') || lowerInput.includes('service')) ||
      lowerInput.includes('new subscription') ||
      lowerInput.includes('create subscription') ||
      lowerInput.includes('subscribe')
    ) {
      // Try to extract subscription details from the message
      const entities: any = {};
      
      // Extract service name (common services)
      const services = ['netflix', 'spotify', 'disney', 'hulu', 'amazon', 'apple', 'youtube', 'adobe', 'microsoft', 'github', 'dropbox', 'notion'];
      const foundService = services.find(s => lowerInput.includes(s));
      if (foundService) {
        entities.name = foundService.charAt(0).toUpperCase() + foundService.slice(1);
      }
      
      // Extract amount ($XX.XX or XX.XX)
      const amountMatch = lowerInput.match(/\$?\d+\.?\d*/);
      if (amountMatch) {
        entities.amount = parseFloat(amountMatch[0].replace('$', ''));
      }

      // Extract billing cycle
      if (lowerInput.includes('monthly') || lowerInput.includes('month')) {
        entities.billingCycle = 'monthly';
      } else if (lowerInput.includes('yearly') || lowerInput.includes('annual') || lowerInput.includes('year')) {
        entities.billingCycle = 'yearly';
      } else if (lowerInput.includes('weekly') || lowerInput.includes('week')) {
        entities.billingCycle = 'weekly';
      }

      return { intent: 'add_subscription', entities };
    }

    // Upcoming Payments
    if (
      lowerInput.includes('upcoming') && lowerInput.includes('payment') ||
      lowerInput.includes('due') ||
      lowerInput.includes('next payment') ||
      lowerInput.includes('when') && lowerInput.includes('pay') ||
      lowerInput.includes('what') && lowerInput.includes('due')
    ) {
      return { intent: 'upcoming_payments', entities: {} };
    }

    // Spending Analytics
    if (
      lowerInput.includes('analytics') ||
      lowerInput.includes('spending') ||
      lowerInput.includes('how much') && (lowerInput.includes('spend') || lowerInput.includes('cost')) ||
      lowerInput.includes('total') && (lowerInput.includes('spend') || lowerInput.includes('cost')) ||
      lowerInput.includes('expense') ||
      lowerInput.includes('budget')
    ) {
      // Check for time period
      const entities: any = {};
      if (lowerInput.includes('month')) entities.period = 'monthly';
      if (lowerInput.includes('year')) entities.period = 'yearly';
      return { intent: 'spending_analytics', entities };
    }

    // Savings Opportunities
    if (
      lowerInput.includes('save') || lowerInput.includes('saving') ||
      lowerInput.includes('optimize') || lowerInput.includes('reduce') ||
      lowerInput.includes('cheaper') || lowerInput.includes('cut cost')
    ) {
      return { intent: 'savings_opportunities', entities: {} };
    }

    // Specific subscription query
    const services = ['netflix', 'spotify', 'disney', 'hulu', 'amazon', 'apple', 'youtube', 'adobe', 'microsoft', 'github', 'dropbox', 'notion'];
    const foundService = services.find(s => lowerInput.includes(s));
    if (foundService && !lowerInput.includes('add')) {
      return { 
        intent: 'subscription_detail', 
        entities: { name: foundService.charAt(0).toUpperCase() + foundService.slice(1) } 
      };
    }

    // Default - didn't understand
    return { intent: 'unknown', entities: {} };
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');

    // Process command with real data
    setTimeout(() => {
      const botResponse = processCommand(userInput);
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const processCommand = (userInput: string): Message => {
    const { intent, entities } = recognizeIntent(userInput);
    const timestamp = new Date();

    switch (intent) {
      case 'view_subscriptions':
        return generateSubscriptionsList(timestamp);

      case 'add_subscription':
        return handleAddSubscriptionIntent(entities, timestamp);

      case 'upcoming_payments':
        return generateUpcomingPayments(timestamp);

      case 'spending_analytics':
        return generateSpendingAnalytics(entities, timestamp);

      case 'savings_opportunities':
        return generateSavingsOpportunities(timestamp);

      case 'subscription_detail':
        return generateSubscriptionDetail(entities.name, timestamp);

      default:
        return generateDefaultResponse(timestamp);
    }
  };

  const generateSubscriptionsList = (timestamp: Date): Message => {
    if (subscriptions.length === 0) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "📊 You don't have any active subscriptions yet.\n\nWould you like to add your first subscription? Just tell me the service name and monthly cost, like:\n\"Add Netflix for $15.99\"",
        timestamp,
        quickReplies: ['Add subscription', 'How to add?'],
      };
    }

    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const subscriptionList = subscriptions
      .filter(s => s.status === 'active')
      .map(sub => {
        const emoji = sub.logo || '📱';
        const amount = `${sub.currency} ${Number(sub.amount).toFixed(2)}`;
        const cycle = sub.billingCycle === 'monthly' ? '/mo' : sub.billingCycle === 'yearly' ? '/yr' : '/wk';
        const nextBilling = new Date(sub.nextBilling).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${emoji} ${sub.name} - ${amount}${cycle} (Next: ${nextBilling})`;
      })
      .join('\n');

    const totalMonthly = Number(analytics?.totalMonthly) || 0;

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `📊 Your Active Subscriptions (${activeCount}):\n\n${subscriptionList}\n\n💰 Total Monthly Cost: $${totalMonthly.toFixed(2)}`,
      timestamp,
      quickReplies: ['Add subscription', 'Show analytics', 'Upcoming payments'],
    };
  };

  const handleAddSubscriptionIntent = (entities: any, timestamp: Date): Message => {
    if (entities.name && entities.amount) {
      // We have enough info, open the add dialog with pre-filled data
      setNewSubData({
        name: entities.name,
        amount: entities.amount.toString(),
        currency: 'USD',
        billingCycle: entities.billingCycle || 'monthly',
        nextBilling: '',
        category: 'Other',
        paymentMethod: '',
      });
      setShowAddDialog(true);

      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `Great! I've opened a form to add ${entities.name} for $${entities.amount}/${entities.billingCycle || 'monthly'}.\n\nPlease fill in the remaining details to complete the setup.`,
        timestamp,
      };
    } else {
      // Need more info
      setShowAddDialog(true);
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "I've opened the subscription form for you. Please provide:\n\n1. Service name (e.g., Netflix)\n2. Monthly cost (e.g., $15.99)\n3. Next billing date\n4. Category\n\nOr you can tell me in a message like:\n\"Add Netflix for $15.99 monthly\"",
        timestamp,
        quickReplies: ['Cancel'],
      };
    }
  };

  const generateUpcomingPayments = (timestamp: Date): Message => {
    if (subscriptions.length === 0) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "You don't have any subscriptions yet, so there are no upcoming payments.\n\nAdd your first subscription to start tracking!",
        timestamp,
        quickReplies: ['Add subscription'],
      };
    }

    const now = Date.now();
    const upcomingPayments = subscriptions
      .filter(sub => sub.status === 'active')
      .map(sub => ({
        ...sub,
        daysUntil: Math.floor((new Date(sub.nextBilling).getTime() - now) / (1000 * 60 * 60 * 24)),
      }))
      .filter(sub => sub.daysUntil >= 0 && sub.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    if (upcomingPayments.length === 0) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "🎉 No payments due in the next 30 days!\n\nYou're all caught up.",
        timestamp,
        quickReplies: ['Show all subscriptions', 'Show analytics'],
      };
    }

    const paymentList = upcomingPayments
      .slice(0, 5)
      .map(sub => {
        const emoji = sub.logo || '📱';
        const amount = `${sub.currency} ${Number(sub.amount).toFixed(2)}`;
        const date = new Date(sub.nextBilling).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const daysText = sub.daysUntil === 0 ? 'Today!' : sub.daysUntil === 1 ? 'Tomorrow' : `in ${sub.daysUntil} days`;
        return `${emoji} ${sub.name} - ${amount} on ${date} (${daysText})`;
      })
      .join('\n');

    const totalDue = upcomingPayments.slice(0, 5).reduce((sum, sub) => sum + Number(sub.amount), 0);

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `📅 Upcoming Payments (Next 30 Days):\n\n${paymentList}\n\n💰 Total: $${totalDue.toFixed(2)}\n\n🔔 I'll remind you 3 days before each payment!`,
      timestamp,
      quickReplies: ['Show all subscriptions', 'Show analytics', 'Set custom reminder'],
    };
  };

  const generateSpendingAnalytics = (entities: any, timestamp: Date): Message => {
    if (!analytics || subscriptions.length === 0) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "You don't have any subscriptions yet, so there's no spending data to analyze.\n\nAdd your subscriptions to start tracking your spending!",
        timestamp,
        quickReplies: ['Add subscription'],
      };
    }

    const totalMonthly = Number(analytics.totalMonthly) || 0;
    const totalYearly = Number(analytics.totalYearly) || 0;
    const activeSubscriptions = Number(analytics.activeSubscriptions) || 0;

    // Calculate category breakdown
    const categoryMap = new Map<string, number>();
    subscriptions.forEach(sub => {
      if (sub.status !== 'active') return;
      const current = categoryMap.get(sub.category) || 0;
      let monthlyAmount = Number(sub.amount);
      if (sub.billingCycle === 'yearly') monthlyAmount = Number(sub.amount) / 12;
      if (sub.billingCycle === 'weekly') monthlyAmount = Number(sub.amount) * 4;
      categoryMap.set(sub.category, current + monthlyAmount);
    });

    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => {
        const percentage = totalMonthly > 0 ? ((amount / totalMonthly) * 100).toFixed(0) : '0';
        return `${category}: $${amount.toFixed(2)} (${percentage}%)`;
      })
      .join('\n');

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `📈 Your Spending Analytics:\n\n💵 Monthly Total: $${totalMonthly.toFixed(2)}\n📅 Yearly Total: $${totalYearly.toFixed(2)}\n📊 Active Services: ${activeSubscriptions}\n\nTop Categories:\n${topCategories}\n\n💡 Would you like to see savings opportunities?`,
      timestamp,
      quickReplies: ['Show savings', 'Category breakdown', 'View subscriptions'],
    };
  };

  const generateSavingsOpportunities = (timestamp: Date): Message => {
    if (subscriptions.length < 2) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "You don't have enough subscriptions yet for me to analyze savings opportunities.\n\nAdd more subscriptions and I'll help you find ways to save!",
        timestamp,
        quickReplies: ['Add subscription', 'Show subscriptions'],
      };
    }

    // Find potential savings
    const opportunities: string[] = [];

    // Check for yearly plan savings (assume 15% savings on annual plans)
    const monthlySubs = subscriptions.filter(sub => 
      sub.status === 'active' && 
      sub.billingCycle === 'monthly' && 
      Number(sub.amount) >= 10
    );

    if (monthlySubs.length > 0) {
      const exampleSub = monthlySubs[0];
      const yearlySavings = (Number(exampleSub.amount) * 12 * 0.15).toFixed(2);
      opportunities.push(`💡 Switch ${exampleSub.name} to annual billing\n   Save: $${yearlySavings}/year`);
    }

    // Check for duplicates in same category
    const categoryCount = new Map<string, number>();
    subscriptions.forEach(sub => {
      if (sub.status === 'active') {
        categoryCount.set(sub.category, (categoryCount.get(sub.category) || 0) + 1);
      }
    });

    categoryCount.forEach((count, category) => {
      if (count > 1 && category !== 'Other') {
        opportunities.push(`⚠️ You have ${count} ${category} subscriptions\n   Consider consolidating to save`);
      }
    });

    // Generic saving tips
    if (opportunities.length === 0) {
      opportunities.push('💡 Review subscriptions you rarely use');
      opportunities.push('💡 Look for family plan options to share costs');
    }

    const opportunitiesList = opportunities.slice(0, 3).join('\n\n');
    const estimatedSavings = (Number(analytics?.totalMonthly) || 0) * 0.2; // Estimate 20% potential savings

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `💰 Cost-Saving Opportunities:\n\n${opportunitiesList}\n\n✨ Potential Monthly Savings: $${estimatedSavings.toFixed(2)}`,
      timestamp,
      quickReplies: ['Show subscriptions', 'Show analytics', 'More tips'],
    };
  };

  const generateSubscriptionDetail = (name: string, timestamp: Date): Message => {
    const sub = subscriptions.find(s => 
      s.name.toLowerCase().includes(name.toLowerCase())
    );

    if (!sub) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `I couldn't find a subscription for "${name}" in your account.\n\nWould you like to add it?`,
        timestamp,
        quickReplies: [`Add ${name}`, 'Show all subscriptions'],
      };
    }

    const daysUntil = Math.floor((new Date(sub.nextBilling).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const nextBillingText = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `in ${daysUntil} days`;

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `${sub.logo || '📱'} ${sub.name} Details:\n\n💵 Cost: ${sub.currency} ${Number(sub.amount).toFixed(2)}/${sub.billingCycle}\n📅 Next Billing: ${new Date(sub.nextBilling).toLocaleDateString()} (${nextBillingText})\n🏷️ Category: ${sub.category}\n💳 Payment: ${sub.paymentMethod}\n📊 Status: ${sub.status}`,
      timestamp,
      quickReplies: ['Edit subscription', 'Cancel subscription', 'Show all'],
    };
  };

  const generateDefaultResponse = (timestamp: Date): Message => {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `I'm not sure I understood that. Here's what I can help you with:\n\n📊 "Show my subscriptions" - View all your active subscriptions\n➕ "Add Netflix $15.99" - Add a new subscription\n📅 "Upcoming payments" - See what's due soon\n📈 "Show analytics" - View spending reports\n💰 "Find savings" - Discover cost-saving opportunities\n\nWhat would you like to do?`,
      timestamp,
      quickReplies: ['Show subscriptions', 'Add subscription', 'Upcoming payments', 'Show analytics'],
    };
  };

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    setTimeout(() => handleSend(), 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddSubscription = async () => {
    if (!newSubData.name || !newSubData.amount || !newSubData.nextBilling) {
      toast.error('Please fill in all required fields');
      return;
    }

    const success = await addNewSubscription({
      ...newSubData,
      amount: parseFloat(newSubData.amount),
      status: 'active',
      logo: '📱',
    });

    if (success) {
      setShowAddDialog(false);
      setNewSubData({
        name: '',
        amount: '',
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: '',
        category: 'Other',
        paymentMethod: '',
      });

      // Add success message to chat
      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `✅ Great! I've added ${newSubData.name} to your subscriptions.\n\n💵 Cost: $${newSubData.amount}/${newSubData.billingCycle}\n📅 Next Billing: ${new Date(newSubData.nextBilling).toLocaleDateString()}\n\n🔔 I'll remind you 3 days before the payment is due!`,
        timestamp: new Date(),
        quickReplies: ['Show all subscriptions', 'Add another', 'Show analytics'],
      };
      setMessages(prev => [...prev, successMessage]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Chat Header */}
      <div className="bg-green-600 dark:bg-green-700 text-white p-4 flex items-center justify-between border-b border-green-500 dark:border-green-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white dark:bg-green-900 rounded-full flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h2 className="text-lg">SubTrack Pro AI Assistant</h2>
            <div className="flex items-center gap-2 text-sm text-green-100 dark:text-green-200">
              <div className="w-2 h-2 bg-green-300 dark:bg-green-400 rounded-full"></div>
              <span>Online • Real-time data</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-green-500 dark:hover:bg-green-600 rounded-full transition-colors">
            <Phone size={20} />
          </button>
          <button className="p-2 hover:bg-green-500 dark:hover:bg-green-600 rounded-full transition-colors">
            <Video size={20} />
          </button>
          <button className="p-2 hover:bg-green-500 dark:hover:bg-green-600 rounded-full transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 hover:bg-green-500 dark:hover:bg-green-600 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Date Separator */}
        <div className="flex justify-center mb-4">
          <Badge variant="secondary" className="text-xs">
            Today
          </Badge>
        </div>

        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`max-w-[70%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-green-600 dark:bg-green-700 text-white'
                      : 'bg-card border shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-green-100 dark:text-green-200' : 'text-muted-foreground'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                
                {/* Quick Replies */}
                {message.quickReplies && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1 bg-card border border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 rounded-full text-sm hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-card border-t p-4">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-accent rounded-full transition-colors">
            <Smile size={24} className="text-muted-foreground" />
          </button>
          <button 
            className="p-2 hover:bg-accent rounded-full transition-colors"
            onClick={() => setShowAddDialog(true)}
            title="Add subscription"
          >
            <Plus size={24} className="text-green-600 dark:text-green-500" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about your subscriptions..."
            className="flex-1 px-4 py-2 border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
          />
          <button
            onClick={handleSend}
            className="p-3 bg-green-600 dark:bg-green-700 text-white rounded-full hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!inputValue.trim()}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          💬 Powered by AI • Real-time subscription data • {user?.isDemo ? 'Demo Mode' : 'Secure & Encrypted'}
        </p>
      </div>

      {/* Add Subscription Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Subscription</DialogTitle>
            <DialogDescription>
              Add a new subscription to track. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={newSubData.name}
                onChange={(e) => setNewSubData({ ...newSubData, name: e.target.value })}
                placeholder="e.g., Netflix"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newSubData.amount}
                  onChange={(e) => setNewSubData({ ...newSubData, amount: e.target.value })}
                  placeholder="15.99"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={newSubData.currency}
                  onValueChange={(value) => setNewSubData({ ...newSubData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="billingCycle">Billing Cycle *</Label>
              <Select
                value={newSubData.billingCycle}
                onValueChange={(value: any) => setNewSubData({ ...newSubData, billingCycle: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nextBilling">Next Billing Date *</Label>
              <Input
                id="nextBilling"
                type="date"
                value={newSubData.nextBilling}
                onChange={(e) => setNewSubData({ ...newSubData, nextBilling: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={newSubData.category}
                onValueChange={(value) => setNewSubData({ ...newSubData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Storage">Storage</SelectItem>
                  <SelectItem value="Productivity">Productivity</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="AI Tools">AI Tools</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                value={newSubData.paymentMethod}
                onChange={(e) => setNewSubData({ ...newSubData, paymentMethod: e.target.value })}
                placeholder="e.g., Visa ****4242"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubscription} disabled={user?.isDemo}>
              {user?.isDemo ? 'Disabled in Demo' : 'Add Subscription'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
