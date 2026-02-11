import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getFamilyGroup, inviteFamilyMember, addFamilyMember, removeFamilyMember, updateMemberRole, shareSubscriptionWithFamily, unshareSubscription, checkAccountExists } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatar: string;
  joinedDate: string;
  sharedSubscriptions: number;
}

export interface SharedSubscription {
  id: string;
  name: string;
  logo: string;
  amount: number;
  currency: string;
  billingCycle: string;
  sharedWith: string[];
  splitType: 'equal' | 'custom';
  owner: string;
  customSplits?: Record<string, number>;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedByName: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt: string;
  token: string;
}

interface FamilyContextType {
  // Data
  members: FamilyMember[];
  sharedSubscriptions: SharedSubscription[];
  pendingInvitations: PendingInvitation[];
  receivedInvitations: PendingInvitation[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Actions
  refreshData: () => Promise<void>;
  inviteMember: (email: string, role: string) => Promise<boolean>;
  resendInvitation: (invitationId: string) => Promise<boolean>;
  cancelInvitation: (invitationId: string) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  updateRole: (memberId: string, newRole: string) => Promise<boolean>;
  shareSubscription: (subscriptionId: string, memberIds: string[]) => Promise<boolean>;
  unshareSubscriptionFromMember: (subscriptionId: string, memberId: string) => Promise<boolean>;
  acceptReceivedInvitation: (token: string) => Promise<boolean>;

  // Computed
  totalSharedCost: number;
  userShare: number;
  userRole: 'owner' | 'admin' | 'member' | 'viewer';
  canManageMembers: boolean;
  canManageSubscriptions: boolean;

  // Error state
  error: string | null;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

// Demo data
const getDemoMembers = (userName: string, userEmail: string): FamilyMember[] => [
  {
    id: 'demo-user',
    name: userName || 'You',
    email: userEmail || 'you@example.com',
    role: 'owner',
    avatar: '👤',
    joinedDate: '2024-01-01',
    sharedSubscriptions: 3,
  },
  {
    id: 'demo-2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'admin',
    avatar: '👩',
    joinedDate: '2024-03-15',
    sharedSubscriptions: 2,
  },
  {
    id: 'demo-3',
    name: 'Mike Chen',
    email: 'mike.chen@example.com',
    role: 'member',
    avatar: '👨',
    joinedDate: '2024-06-20',
    sharedSubscriptions: 2,
  },
];

const getDemoSharedSubscriptions = (): SharedSubscription[] => [
  {
    id: 'demo-shared-1',
    name: 'Netflix Premium',
    logo: '🎬',
    amount: 19.99,
    currency: 'USD',
    billingCycle: 'monthly',
    sharedWith: ['demo-user', 'demo-2', 'demo-3'],
    splitType: 'equal',
    owner: 'demo-user',
  },
  {
    id: 'demo-shared-2',
    name: 'Spotify Family',
    logo: '🎵',
    amount: 16.99,
    currency: 'USD',
    billingCycle: 'monthly',
    sharedWith: ['demo-user', 'demo-2'],
    splitType: 'equal',
    owner: 'demo-user',
  },
  {
    id: 'demo-shared-3',
    name: 'YouTube Premium Family',
    logo: '📺',
    amount: 22.99,
    currency: 'USD',
    billingCycle: 'monthly',
    sharedWith: ['demo-user', 'demo-3'],
    splitType: 'equal',
    owner: 'demo-2',
  },
];

interface FamilyProviderProps {
  children: ReactNode;
  user: any;
  onUserUpdate?: (userData: any) => void;
}

export function FamilyProvider({ children, user, onUserUpdate }: FamilyProviderProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [sharedSubscriptions, setSharedSubscriptions] = useState<SharedSubscription[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const totalSharedCost = sharedSubscriptions.reduce((sum, sub) => sum + Number(sub.amount), 0);

  const userShare = sharedSubscriptions.reduce((sum, sub) => {
    const userId = user?.isDemo ? 'demo-user' : user?.id;
    if (sub.sharedWith.includes(userId)) {
      if (sub.splitType === 'equal') {
        return sum + (Number(sub.amount) / sub.sharedWith.length);
      } else if (sub.customSplits && sub.customSplits[userId]) {
        return sum + Number(sub.customSplits[userId]);
      }
    }
    return sum;
  }, 0);

  // Get current user's role
  const userId = user?.isDemo ? 'demo-user' : user?.id;
  const currentUserMember = members.find(m => m.id === userId);
  const userRole = currentUserMember?.role || (user?.isDemo ? 'owner' : 'viewer');

  // Permission checks
  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  const canManageSubscriptions = userRole === 'owner' || userRole === 'admin';

  // Load data when user changes or on mount
  const loadData = useCallback(async (showLoader = true) => {
    if (!user) {
      console.log('FamilyContext: No user, skipping data load');
      setIsLoading(false);
      return;
    }

    // Handle demo mode
    if (user.isDemo) {
      console.log('FamilyContext: Demo mode, using demo data');
      setMembers(getDemoMembers(user.name, user.email));
      setSharedSubscriptions(getDemoSharedSubscriptions());
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    // Validate access token
    if (!user.accessToken) {
      console.error('FamilyContext: No access token available');
      setError('Session expired. Please log in again.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    console.log('FamilyContext: Loading data for authenticated user');

    if (showLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const { getFamilyGroup, getPendingInvitations } = await import('../utils/api');

      const [groupResponse, invitationsResponse] = await Promise.all([
        getFamilyGroup(user.accessToken),
        getPendingInvitations(user.accessToken)
      ]);

      console.log('FamilyContext: Data loaded successfully', {
        members: groupResponse.familyGroup?.members?.length || 0,
        sharedSubscriptions: groupResponse.familyGroup?.sharedSubscriptions?.length || 0,
        receivedInvitations: invitationsResponse.invitations?.length || 0,
      });

      // Add current user if not in members list
      let membersData = groupResponse.familyGroup?.members || [];
      const currentUserInMembers = membersData.some((m: any) => m.id === user.id);

      if (!currentUserInMembers) {
        // Add current user as owner
        membersData = [{
          id: user.id,
          name: user.name || 'You',
          email: user.email,
          role: 'owner',
          avatar: '👤',
          joinedDate: new Date().toISOString(),
          sharedSubscriptions: 0,
        }, ...membersData];
      }

      setMembers(membersData);
      setSharedSubscriptions(groupResponse.familyGroup?.sharedSubscriptions || []);

      const allInvitations = invitationsResponse.invitations || [];
      const currentUserId = user.id;
      const currentUserEmail = user.email?.toLowerCase().trim();

      console.log('FamilyContext: Filtering invitations for:', currentUserEmail);

      // 1. Invitations SENT BY the current user
      const sent = allInvitations.filter((inv: any) => {
        const inviterId = inv.invitedBy || inv.invited_by;
        return inviterId === currentUserId;
      });
      setPendingInvitations(sent);

      // 2. Invitations RECEIVED BY the current user (show on Dashboard)
      const received = allInvitations.filter((inv: any) => {
        const targetEmail = inv.email?.toLowerCase().trim();
        const inviterId = inv.invitedBy || inv.invited_by;

        // Match if: target email is mine AND I didn't send it myself
        const isForMe = targetEmail === currentUserEmail;
        const isNotByMe = inviterId !== currentUserId;
        const isPending = inv.status === 'pending';

        return isForMe && isNotByMe && isPending;
      });

      console.log(`FamilyContext: Processed ${allInvitations.length} total. Sent: ${sent.length}, Received: ${received.length}`);
      setReceivedInvitations(received);
    } catch (error: any) {
      console.error('FamilyContext: Failed to load data:', error);
      setError(error.message || 'Failed to load data');

      // Set empty state instead of failing completely
      setMembers([]);
      setSharedSubscriptions([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Refresh data
  const refreshData = useCallback(async () => {
    console.log('FamilyContext: Manual refresh triggered');
    await loadData(false);
  }, [loadData]);

  // Invite member
  const inviteMember = useCallback(async (email: string, role: string): Promise<boolean> => {
    if (!user || user.isDemo) {
      toast.error('Cannot invite members in demo mode. Please create an account.');
      return false;
    }

    if (!user.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      console.log('FamilyContext: Validating user existence for', email);

      // Step 1: Check if user exists in the system
      const accountCheck = await checkAccountExists(email);

      if (!accountCheck.exists) {
        toast.error('Invitation not sent: User is invalid or not registered in our system.');
        return false;
      }

      console.log('FamilyContext: Inviting member', email, role);
      const response = await inviteFamilyMember(user.accessToken, email, role);

      if (response.success) {
        toast.success(`Invitation sent to ${email}`);
        await refreshData();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('FamilyContext: Failed to invite member:', error);
      toast.error('Failed to send invitation: ' + error.message);
      return false;
    }
  }, [user, refreshData]);

  // Remove member
  const removeMember = useCallback(async (memberId: string): Promise<boolean> => {
    if (!user || user.isDemo) {
      toast.error('Cannot remove members in demo mode. Please create an account.');
      return false;
    }

    if (!user.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      console.log('FamilyContext: Removing member', memberId);
      await removeFamilyMember(user.accessToken, memberId);
      toast.success('Member removed successfully');

      await refreshData();
      return true;
    } catch (error: any) {
      console.error('FamilyContext: Failed to remove member:', error);
      toast.error('Failed to remove member: ' + error.message);
      return false;
    }
  }, [user, refreshData]);

  // Update role
  const updateRole = useCallback(async (memberId: string, newRole: string): Promise<boolean> => {
    if (!user || user.isDemo) {
      toast.error('Cannot update roles in demo mode. Please create an account.');
      return false;
    }

    if (!user.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      console.log('FamilyContext: Updating member role', memberId, newRole);
      await updateMemberRole(user.accessToken, memberId, newRole);
      toast.success('Member role updated successfully');

      await refreshData();
      return true;
    } catch (error: any) {
      console.error('FamilyContext: Failed to update role:', error);
      toast.error('Failed to update role: ' + error.message);
      return false;
    }
  }, [user, refreshData]);

  // Share subscription
  const shareSubscription = useCallback(async (subscriptionId: string, memberIds: string[]): Promise<boolean> => {
    if (!user || user.isDemo) {
      toast.error('Cannot share subscriptions in demo mode. Please create an account.');
      return false;
    }

    if (!user.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      console.log('FamilyContext: Sharing subscription', subscriptionId, memberIds);
      await shareSubscriptionWithFamily(user.accessToken, subscriptionId, memberIds);
      toast.success('Subscription shared successfully');

      await refreshData();
      return true;
    } catch (error: any) {
      console.error('FamilyContext: Failed to share subscription:', error);
      toast.error('Failed to share subscription: ' + error.message);
      return false;
    }
  }, [user, refreshData]);

  // Unshare subscription
  const unshareSubscriptionFromMember = useCallback(async (subscriptionId: string, memberId: string): Promise<boolean> => {
    if (!user || user.isDemo) {
      toast.error('Cannot unshare subscriptions in demo mode. Please create an account.');
      return false;
    }

    if (!user.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      console.log('FamilyContext: Unsharing subscription', subscriptionId, memberId);
      await unshareSubscription(user.accessToken, subscriptionId, memberId);
      toast.success('Subscription unshared successfully');

      await refreshData();
      return true;
    } catch (error: any) {
      console.error('FamilyContext: Failed to unshare subscription:', error);
      toast.error('Failed to unshare subscription: ' + error.message);
      return false;
    }
  }, [user, refreshData]);

  // Resend invitation
  const resendInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    if (!user || user.isDemo) {
      toast.error('Cannot resend invitations in demo mode. Please create an account.');
      return false;
    }

    if (!user.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      console.log('FamilyContext: Resending invitation', invitationId);
      const { resendInvitation: resendInvitationAPI } = await import('../utils/api');
      await resendInvitationAPI(user.accessToken, invitationId);
      toast.success('Invitation resent successfully');

      await refreshData();
      return true;
    } catch (error: any) {
      console.error('FamilyContext: Failed to resend invitation:', error);
      toast.error('Failed to resend invitation: ' + error.message);
      return false;
    }
  }, [user, refreshData]);

  // Cancel invitation
  const cancelInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    if (!user || user.isDemo) {
      toast.error('Cannot cancel invitations in demo mode. Please create an account.');
      return false;
    }

    if (!user.accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      console.log('FamilyContext: Cancelling invitation', invitationId);
      const { cancelInvitation: cancelInvitationAPI } = await import('../utils/api');
      await cancelInvitationAPI(user.accessToken, invitationId);
      toast.success('Invitation cancelled');

      await refreshData();
      return true;
    } catch (error: any) {
      console.error('FamilyContext: Failed to cancel invitation:', error);
      toast.error('Failed to cancel invitation: ' + error.message);
      return false;
    }
  }, [user, refreshData]);

  // Accept received invitation
  const acceptReceivedInvitation = useCallback(async (token: string): Promise<boolean> => {
    try {
      setIsRefreshing(true);

      // Step 1: Find the invitation locally to validate against current user
      const invitation = receivedInvitations.find(inv => inv.token === token);
      if (invitation && user && invitation.email.toLowerCase() !== user.email.toLowerCase()) {
        toast.error('Identity mismatch: This invitation was sent to a different email address.');
        return false;
      }

      console.log('FamilyContext: Accepting invitation with token', token);
      const { acceptInvitation: acceptInvitationAPI } = await import('../utils/api');
      const response = await acceptInvitationAPI(token, user?.accessToken);

      if (response.user && onUserUpdate) {
        onUserUpdate(response.user);
      }

      toast.success('Invitation accepted successfully!');
      await refreshData();
      return true;
    } catch (error: any) {
      console.error('FamilyContext: Failed to accept invitation:', error);
      toast.error('Failed to accept invitation: ' + error.message);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  const value: FamilyContextType = {
    members,
    sharedSubscriptions,
    pendingInvitations,
    receivedInvitations,
    isLoading,
    isRefreshing,
    refreshData,
    inviteMember,
    resendInvitation,
    cancelInvitation,
    removeMember,
    updateRole,
    shareSubscription,
    unshareSubscriptionFromMember,
    acceptReceivedInvitation,
    totalSharedCost,
    userShare,
    userRole,
    canManageMembers,
    canManageSubscriptions,
    error,
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}

// Custom hook to use the family context
export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
