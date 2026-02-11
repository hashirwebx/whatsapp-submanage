# Migration Guide: Adding Real-Time Sync to New Components

This guide shows how to migrate existing components or create new ones that use the real-time synchronization system.

## Overview

Any component that needs subscription or analytics data should use the `useSubscriptions()` hook instead of making direct API calls.

## Step-by-Step Migration

### Step 1: Remove Old Imports

**Before:**
```typescript
import { useState, useEffect } from 'react';
import { getSubscriptions, getAnalytics } from '../utils/api';
import { toast } from 'sonner@2.0.3';
```

**After:**
```typescript
// Remove useState/useEffect if only used for data loading
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { toast } from 'sonner@2.0.3'; // Keep if still needed
```

### Step 2: Remove Local State

**Before:**
```typescript
const [subscriptions, setSubscriptions] = useState([]);
const [analytics, setAnalytics] = useState(null);
const [isLoading, setIsLoading] = useState(true);
```

**After:**
```typescript
const { subscriptions, analytics, isLoading } = useSubscriptions();
```

### Step 3: Remove Data Loading Logic

**Before:**
```typescript
useEffect(() => {
  loadData();
}, [user]);

const loadData = async () => {
  setIsLoading(true);
  try {
    const response = await getSubscriptions(user.accessToken);
    setSubscriptions(response.subscriptions);
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};
```

**After:**
```typescript
// Nothing! The context handles all data loading
// Data automatically loads when component mounts
// Data automatically updates when user changes
```

### Step 4: Update CRUD Operations

**Before (Add):**
```typescript
const handleAdd = async (data) => {
  try {
    await addSubscription(user.accessToken, data);
    toast.success('Added!');
    await loadData(); // Manual reload
  } catch (error) {
    toast.error('Failed');
  }
};
```

**After (Add):**
```typescript
const { addNewSubscription } = useSubscriptions();

const handleAdd = async (data) => {
  const success = await addNewSubscription(data);
  // Toast and reload handled by context!
};
```

**Before (Delete):**
```typescript
const handleDelete = async (id) => {
  try {
    await deleteSubscription(user.accessToken, id);
    toast.success('Deleted!');
    await loadData(); // Manual reload
  } catch (error) {
    toast.error('Failed');
  }
};
```

**After (Delete):**
```typescript
const { deleteExistingSubscription } = useSubscriptions();

const handleDelete = async (id) => {
  await deleteExistingSubscription(id);
  // Toast and reload handled by context!
};
```

### Step 5: Add Refresh Button (Optional)

**Add this for manual refresh capability:**
```typescript
const { refreshData, isRefreshing } = useSubscriptions();

return (
  <Button onClick={refreshData} disabled={isRefreshing}>
    <RefreshIcon className={isRefreshing ? 'animate-spin' : ''} />
    {isRefreshing ? 'Refreshing...' : 'Refresh'}
  </Button>
);
```

## Complete Example: Migrating a Component

### Before Migration

```typescript
import { useState, useEffect } from 'react';
import { getSubscriptions } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export function MyComponent({ user }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, [user]);

  const loadSubscriptions = async () => {
    if (!user?.accessToken) return;
    
    setIsLoading(true);
    try {
      const response = await getSubscriptions(user.accessToken);
      setSubscriptions(response.subscriptions || []);
    } catch (error) {
      console.error('Failed to load:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {subscriptions.map(sub => (
        <div key={sub.id}>{sub.name}</div>
      ))}
    </div>
  );
}
```

### After Migration

```typescript
import { useSubscriptions } from '../contexts/SubscriptionContext';

export function MyComponent({ user }) {
  const { subscriptions, isLoading } = useSubscriptions();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {subscriptions.map(sub => (
        <div key={sub.id}>{sub.name}</div>
      ))}
    </div>
  );
}
```

**Lines of code: 40 → 16 (60% reduction!)**

## Migrating FamilySharing Component

The FamilySharing component currently uses static data. Here's how to integrate it with real-time sync:

### Option 1: Use Subscription Data

```typescript
import { useSubscriptions } from '../contexts/SubscriptionContext';

export function FamilySharing({ user }) {
  const { subscriptions } = useSubscriptions();
  
  // Filter shared subscriptions
  const sharedSubscriptions = subscriptions.filter(
    sub => sub.sharedWith && sub.sharedWith.length > 0
  );
  
  // Calculate stats
  const totalSharedCost = sharedSubscriptions.reduce(
    (sum, sub) => sum + sub.amount, 0
  );
  
  // Rest of component...
}
```

### Option 2: Extend Context for Family Data

If you need family-specific data, extend the context:

**1. Add to SubscriptionContext:**
```typescript
interface SubscriptionContextType {
  // ... existing properties
  familyMembers: FamilyMember[];
  getFamilyData: () => Promise<void>;
}
```

**2. Use in FamilySharing:**
```typescript
const { subscriptions, familyMembers, getFamilyData } = useSubscriptions();
```

## Common Migration Patterns

### Pattern 1: Simple Display Component

```typescript
// Before: 30+ lines with state and loading
// After: 10 lines

const { subscriptions, isLoading } = useSubscriptions();
if (isLoading) return <Spinner />;
return <List items={subscriptions} />;
```

### Pattern 2: Component with Mutations

```typescript
// Before: 50+ lines with CRUD operations and reloading
// After: 20 lines

const { addNewSubscription, deleteExistingSubscription } = useSubscriptions();

const handleAdd = async (data) => {
  await addNewSubscription(data);
};

const handleDelete = async (id) => {
  await deleteExistingSubscription(id);
};
```

### Pattern 3: Analytics/Charts Component

```typescript
// Before: Loading analytics separately
// After: Use from context

const { analytics, subscriptions } = useSubscriptions();

// Calculate custom metrics from subscriptions
const categoryData = subscriptions.reduce((acc, sub) => {
  acc[sub.category] = (acc[sub.category] || 0) + sub.amount;
  return acc;
}, {});
```

## Checklist for Migration

- [ ] Import `useSubscriptions` hook
- [ ] Remove local state for subscriptions/analytics
- [ ] Remove useEffect data loading logic
- [ ] Remove manual API calls
- [ ] Update CRUD operations to use context methods
- [ ] Remove manual refresh/reload calls
- [ ] Test component updates when data changes
- [ ] Add manual refresh button (optional)
- [ ] Remove unused imports
- [ ] Update TypeScript types if needed

## Benefits After Migration

✅ **Less Code**
- 40-60% reduction in component size
- No boilerplate for loading/error states
- No manual refresh logic

✅ **Better UX**
- Automatic synchronization
- Instant updates across all components
- Consistent loading states

✅ **Easier Maintenance**
- Single source of truth
- Centralized error handling
- Type-safe operations

✅ **Better Performance**
- Fewer API calls
- Shared data cache
- Optimized re-renders

## Testing After Migration

1. **Verify data loads correctly**
   - Component should show loading state initially
   - Data should appear after load

2. **Test synchronization**
   - Add subscription in one component
   - Verify it appears in migrated component
   - No page refresh should be needed

3. **Test error handling**
   - Disconnect network
   - Verify error handling works
   - Check user gets appropriate feedback

4. **Test demo mode**
   - Switch to demo mode
   - Verify demo data appears
   - Verify mutations are prevented

## Need Help?

- Check `/REALTIME_SYNC_GUIDE.md` for detailed guide
- Check `/QUICK_SYNC_REFERENCE.md` for quick reference
- Review migrated components (Dashboard, SubscriptionManager, Analytics)
- Check the context implementation at `/contexts/SubscriptionContext.tsx`
