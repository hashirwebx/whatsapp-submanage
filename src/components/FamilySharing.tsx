import { useState } from 'react';
import { Users, Plus, Crown, Shield, Eye, Mail, MoreVertical, UserPlus, Check, X, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { useFamily } from '../contexts/FamilyContext';

interface FamilySharingProps {
  user: any;
}

export function FamilySharing({ user }: FamilySharingProps) {
  const {
    members,
    sharedSubscriptions,
    pendingInvitations,
    isLoading,
    isRefreshing,
    refreshData,
    inviteMember,
    resendInvitation,
    cancelInvitation,
    removeMember,
    updateRole,
    totalSharedCost,
    userShare,
    userRole,
    canManageMembers,
  } = useFamily();

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown size={16} className="text-yellow-600 dark:text-yellow-500" />;
      case 'admin': return <Shield size={16} className="text-blue-600 dark:text-blue-500" />;
      case 'member': return <Users size={16} className="text-green-600 dark:text-green-500" />;
      case 'viewer': return <Eye size={16} className="text-muted-foreground" />;
      default: return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'admin': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'member': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'viewer': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !inviteRole) return;

    setIsSubmitting(true);
    const success = await inviteMember(inviteEmail, inviteRole);
    setIsSubmitting(false);

    if (success) {
      setIsInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('member');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;

    setIsSubmitting(true);
    await removeMember(memberToDelete);
    setIsSubmitting(false);
    setMemberToDelete(null);
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    await updateRole(memberId, newRole);
  };

  const calculateSplitAmount = (subscription: any) => {
    if (subscription.splitType === 'equal') {
      return (Number(subscription.amount) / subscription.sharedWith.length).toFixed(2);
    }
    // Handle custom splits if implemented
    return (Number(subscription.amount) / subscription.sharedWith.length).toFixed(2);
  };

  const currentUserId = user?.isDemo ? 'demo-user' : user?.id;

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading family data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl mb-2">Family Sharing</h1>
            <p className="text-muted-foreground">Manage shared subscriptions and family members</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={refreshData}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                  disabled={!canManageMembers}
                >
                  <UserPlus size={20} className="mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Family Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your family sharing group
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="member@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin - Can manage all subscriptions</SelectItem>
                        <SelectItem value="member">Member - Can view and use shared subscriptions</SelectItem>
                        <SelectItem value="viewer">Viewer - Can only view subscriptions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-400">
                    <p>💡 The invited member will receive an email with a link to join your family group.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInviteMember}
                    disabled={isSubmitting || user?.isDemo || !inviteEmail}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                  >
                    {isSubmitting ? 'Sending...' : user?.isDemo ? 'Demo Mode' : 'Send Invitation'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats - Real Data */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Family Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{members.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active members
              {pendingInvitations && pendingInvitations.length > 0 && (
                <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                  (+{pendingInvitations.length} pending)
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Shared Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{sharedSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Services shared</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Shared Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              ${totalSharedCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Combined monthly</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Your Share</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600 dark:text-green-400">
              ${userShare.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Your portion</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Family Members - Real Data */}
        <Card>
          <CardHeader>
            <CardTitle>Family Members ({members.length})</CardTitle>
            <CardDescription>Manage access and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users size={48} className="mx-auto mb-3 opacity-50" />
                <p>No family members yet</p>
                <p className="text-sm mt-1">Invite members to start sharing</p>
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-600 dark:to-green-800 rounded-full flex items-center justify-center text-2xl">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.name}</p>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleBadgeColor(member.role)}>
                            {member.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {member.sharedSubscriptions} shared
                          </span>
                        </div>
                      </div>
                    </div>
                    {canManageMembers && member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'admin')} disabled={user?.isDemo}>
                            <Shield size={16} className="mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'member')} disabled={user?.isDemo}>
                            <Users size={16} className="mr-2" />
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'viewer')} disabled={user?.isDemo}>
                            <Eye size={16} className="mr-2" />
                            Make Viewer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setMemberToDelete(member.id)}
                            className="text-red-600 dark:text-red-400"
                            disabled={user?.isDemo}
                          >
                            <Trash2 size={16} className="mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {pendingInvitations && pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations ({pendingInvitations.length})</CardTitle>
              <CardDescription>Invitations waiting for acceptance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingInvitations.map((invitation) => {
                  const expiresAt = new Date(invitation.expiresAt);
                  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-600 dark:to-yellow-800 rounded-full flex items-center justify-center">
                          <Mail size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{invitation.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleBadgeColor(invitation.role)}>
                              {invitation.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              • Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await resendInvitation(invitation.id);
                          }}
                          disabled={user?.isDemo}
                        >
                          <RefreshCw size={14} className="mr-1" />
                          Resend
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          onClick={async () => {
                            if (window.confirm('Cancel this invitation?')) {
                              await cancelInvitation(invitation.id);
                            }
                          }}
                          disabled={user?.isDemo}
                        >
                          <X size={14} className="mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Understanding access levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={20} className="text-yellow-600 dark:text-yellow-500" />
                  <h4 className="font-semibold">Owner</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-600 dark:text-green-400" />
                    Full access to all features
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-600 dark:text-green-400" />
                    Manage all members and subscriptions
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-600 dark:text-green-400" />
                    Delete family group
                  </li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={20} className="text-blue-600 dark:text-blue-500" />
                  <h4 className="font-semibold">Admin</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-600 dark:text-green-400" />
                    Add and remove members
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-600 dark:text-green-400" />
                    Manage all subscriptions
                  </li>
                  <li className="flex items-center gap-2">
                    <X size={14} className="text-red-600 dark:text-red-400" />
                    Cannot delete family group
                  </li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={20} className="text-green-600 dark:text-green-500" />
                  <h4 className="font-semibold">Member</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-600 dark:text-green-400" />
                    View shared subscriptions
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-600 dark:text-green-400" />
                    Use shared services
                  </li>
                  <li className="flex items-center gap-2">
                    <X size={14} className="text-red-600 dark:text-red-400" />
                    Cannot manage subscriptions
                  </li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={20} className="text-muted-foreground" />
                  <h4 className="font-semibold">Viewer</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-600 dark:text-green-400" />
                    View subscription list only
                  </li>
                  <li className="flex items-center gap-2">
                    <X size={14} className="text-red-600 dark:text-red-400" />
                    Cannot use services
                  </li>
                  <li className="flex items-center gap-2">
                    <X size={14} className="text-red-600 dark:text-red-400" />
                    Read-only access
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shared Subscriptions - Real Data */}
      <Card>
        <CardHeader>
          <CardTitle>Shared Subscriptions ({sharedSubscriptions.length})</CardTitle>
          <CardDescription>Services shared with family members</CardDescription>
        </CardHeader>
        <CardContent>
          {sharedSubscriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail size={48} className="mx-auto mb-3 opacity-50" />
              <p>No shared subscriptions yet</p>
              <p className="text-sm mt-1">Start sharing subscriptions with your family</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sharedSubscriptions.map((sub) => (
                <div key={sub.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-600 dark:to-green-800 rounded-lg flex items-center justify-center text-2xl">
                        {sub.logo}
                      </div>
                      <div>
                        <h4 className="font-semibold">{sub.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${Number(sub.amount).toFixed(2)}/{sub.billingCycle} • Split {sub.splitType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold">${calculateSplitAmount(sub)}</p>
                      <p className="text-xs text-muted-foreground">per person</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-3">Shared with {sub.sharedWith.length} member{sub.sharedWith.length !== 1 ? 's' : ''}:</p>
                    <div className="flex gap-2 flex-wrap">
                      {sub.sharedWith.map(memberId => {
                        const member = members.find(m => m.id === memberId);
                        return member ? (
                          <div key={memberId} className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                            <span>{member.avatar}</span>
                            <span>{member.name}</span>
                            {memberId === sub.owner && (
                              <Badge variant="secondary" className="text-xs">Owner</Badge>
                            )}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Member Confirmation Dialog */}
      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Family Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This member will be removed from the family group and lose access to all shared subscriptions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Removing...' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
