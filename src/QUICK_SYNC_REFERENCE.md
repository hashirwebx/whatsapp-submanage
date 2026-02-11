# Real-Time Sync - Quick Reference

## 🚀 Quick Start

### Import the Hook
```typescript
import { useSubscriptions } from '../contexts/SubscriptionContext';
```

### Use in Component
```typescript
function MyComponent() {
  const { 
    subscriptions,      // All subscriptions
    analytics,          // Analytics data
    isLoading,          // Loading state
    refreshData         // Manual refresh
  } = useSubscriptions();
  
  return <div>{/* Your JSX */}</div>;
}
```

## 📦 Available Data & Methods

### Data
```typescript
subscriptions: Subscription[]  // Array of all subscriptions
analytics: Analytics | null    // Analytics data object
```

### Loading States
```typescript
isLoading: boolean      // Initial data load (true on first mount)
isRefreshing: boolean   // Background refresh (true during updates)
error: string | null    // Error message if any
```

### Actions
```typescript
// Refresh all data manually
await refreshData();

// Add new subscription (auto-refreshes)
const success = await addNewSubscription({
  name: 'Netflix',
  amount: 15.99,
  currency: 'USD',
  billingCycle: 'monthly',
  nextBilling: '2025-12-01',
  category: 'Entertainment',
  paymentMethod: 'Visa ****4242'
});

// Update subscription (auto-refreshes)
const success = await updateExistingSubscription('sub-id', {
  amount: 19.99
});

// Delete subscription (auto-refreshes)
const success = await deleteExistingSubscription('sub-id');
```

## 💡 Common Use Cases

### Display Subscriptions
```typescript
const { subscriptions, isLoading } = useSubscriptions();

if (isLoading) {
  return <LoadingSpinner />;
}

return (
  <div>
    {subscriptions.map(sub => (
      <SubscriptionCard key={sub.id} subscription={sub} />
    ))}
  </div>
);
```

### Display Analytics
```typescript
const { analytics } = useSubscriptions();

return (
  <div>
    <h2>Monthly: ${analytics?.totalMonthly || 0}</h2>
    <h2>Yearly: ${analytics?.totalYearly || 0}</h2>
    <h2>Active: {analytics?.activeSubscriptions || 0}</h2>
  </div>
);
```

### Add Subscription Form
```typescript
const { addNewSubscription } = useSubscriptions();
const [formData, setFormData] = useState({...});

const handleSubmit = async () => {
  const success = await addNewSubscription(formData);
  if (success) {
    // Form submitted successfully
    // All components auto-updated!
    setFormData({...}); // Reset form
  }
};
```

### Delete with Confirmation
```typescript
const { deleteExistingSubscription } = useSubscriptions();

const handleDelete = async (id: string) => {
  if (confirm('Delete this subscription?')) {
    await deleteExistingSubscription(id);
    // All components auto-updated!
  }
};
```

### Manual Refresh Button
```typescript
const { refreshData, isRefreshing } = useSubscriptions();

return (
  <button onClick={refreshData} disabled={isRefreshing}>
    <RefreshIcon className={isRefreshing ? 'animate-spin' : ''} />
    {isRefreshing ? 'Refreshing...' : 'Refresh'}
  </button>
);
```

## ⚡ Key Features

✅ **Automatic Synchronization**
- Add/update/delete automatically refreshes all components
- No manual page refresh needed
- All pages stay in sync

✅ **Smart Loading States**
- `isLoading`: Shows on initial load
- `isRefreshing`: Shows during background updates
- Different states for better UX

✅ **Error Handling**
- Automatic session validation
- Auto-logout on token expiry
- User-friendly error messages

✅ **Demo Mode Support**
- Automatic demo data when in demo mode
- Prevents mutations with helpful messages
- Seamless mode switching

## 🔍 What Gets Synchronized?

When you perform any action (add/update/delete), these update automatically:

### Dashboard
- Total monthly/yearly spend
- Active subscription count
- Upcoming payments
- Subscription list
- Category breakdown

### Subscriptions Page
- Complete subscription list
- Search/filter results
- Subscription cards

### Analytics
- All charts and graphs
- Category distribution
- Spending trends
- Top subscriptions

## 🎯 Best Practices

### ✅ DO
```typescript
// Use the hook at component level
const { subscriptions } = useSubscriptions();

// Check loading state
if (isLoading) return <Spinner />;

// Use the context methods for mutations
await addNewSubscription(data);
```

### ❌ DON'T
```typescript
// Don't make direct API calls
const data = await getSubscriptions(token); // ❌

// Don't store subscriptions in local state
const [subs, setSubs] = useState([]); // ❌

// Don't manually reload
useEffect(() => loadData(), []); // ❌
```

## 🐛 Troubleshooting

### Data not updating?
1. Check browser console for errors
2. Verify you're using `useSubscriptions()` hook
3. Ensure component is wrapped in `<SubscriptionProvider>`
4. Try manual refresh button

### Loading stuck?
1. Check network tab for failed requests
2. Verify backend is running
3. Check access token validity

### Demo mode issues?
- Demo data doesn't persist
- Create real account for full functionality
- Demo prevents all mutations

## 📚 More Resources

- `/REALTIME_SYNC_GUIDE.md` - Complete developer guide
- `/SYNC_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `/contexts/SubscriptionContext.tsx` - Source code
