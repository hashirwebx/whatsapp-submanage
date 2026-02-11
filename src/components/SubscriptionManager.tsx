import { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Bell, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useSubscriptions, Subscription } from '../contexts/SubscriptionContext';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'sonner@2.0.3';
import { formatCurrency, convertAndFormatCurrency } from '../utils/currencyConverter';
import { AddSubscription } from './AddSubscription';
import { useFamily } from '../contexts/FamilyContext';


interface SubscriptionManagerProps {
  user: any;
}

export function SubscriptionManager({ user }: SubscriptionManagerProps) {
  const { subscriptions, isLoading, updateExistingSubscription, deleteExistingSubscription, refreshData } = useSubscriptions();
  const { settings } = useSettings();
  const { canManageSubscriptions } = useFamily();

  const preferredCurrency = settings.currency || 'USD';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [subscriptionToEdit, setSubscriptionToEdit] = useState<Subscription | null>(null);

  const categories = ['All', 'Entertainment', 'Music', 'Software', 'AI Tools', 'Development', 'Storage', 'Productivity', 'Cloud Services'];

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || sub.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    await deleteExistingSubscription(id);
  };

  const handleUpdateSubscription = async (id: string, updates: Partial<Subscription>) => {
    await updateExistingSubscription(id, updates);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCycleDisplay = (cycle: string) => {
    switch (cycle) {
      case 'monthly': return '/mo';
      case 'yearly': return '/yr';
      case 'weekly': return '/wk';
      default: return '';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl mb-2">Subscription Manager</h1>
            <p className="text-gray-600">Track and manage all your recurring payments</p>
          </div>
          <Button
            className="bg-[#225E56] hover:bg-[#1a4a44]"
            onClick={() => {
              setSubscriptionToEdit(null);
              setIsAddDialogOpen(true);
            }}
            disabled={!canManageSubscriptions}
          >
            <Plus size={20} className="mr-2" />
            Add Subscription
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <Filter size={16} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat.toLowerCase()}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={40} className="animate-spin text-green-600" />
        </div>
      )}

      {/* Subscriptions Grid */}
      {!isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.map((sub) => (
            <Card key={sub.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-2xl">
                      {sub.logo}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{sub.name}</CardTitle>
                      <CardDescription>{sub.category}</CardDescription>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl">{convertAndFormatCurrency(sub.amount, sub.currency, preferredCurrency)}</span>
                    <span className="text-gray-500">{getCycleDisplay(sub.billingCycle)}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next billing:</span>
                      <span>{new Date(sub.nextBilling).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment:</span>
                      <span>{sub.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(sub.status)}>
                        {sub.status}
                      </Badge>
                    </div>
                    {sub.website && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Website:</span>
                        <a
                          href={sub.website.startsWith('http') ? sub.website : `https://${sub.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#225E56] hover:underline text-xs truncate max-w-[150px]"
                          title={sub.website}
                        >
                          {sub.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {canManageSubscriptions && (
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                      <button
                        className="flex items-center justify-center gap-1 py-2 text-sm hover:bg-gray-100 rounded"
                        onClick={() => {
                          setSubscriptionToEdit(sub);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="flex items-center justify-center gap-1 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                        onClick={() => handleDeleteSubscription(sub.id)}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}

                  {!canManageSubscriptions && (
                    <div className="pt-3 border-t text-center">
                      <p className="text-xs text-muted-foreground italic">Read-only access</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchTerm || filterCategory !== 'all' ? 'No subscriptions found matching your criteria' : 'No subscriptions yet'}
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
            <Plus size={18} className="mr-2" />
            Add your first subscription
          </Button>
        </div>
      )}

      {/* Add Subscription Dialog - Using comprehensive form */}
      <AddSubscription
        isOpen={isAddDialogOpen}
        subscriptionToEdit={subscriptionToEdit}
        onClose={() => {
          setIsAddDialogOpen(false);
          setSubscriptionToEdit(null);
        }}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          setSubscriptionToEdit(null);
          refreshData();
        }}
      />
    </div>
  );
}