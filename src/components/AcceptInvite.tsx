import { useState, useEffect } from 'react';
import { UserPlus, Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { acceptInvitation } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface AcceptInviteProps {
  token: string;
  user?: any;
  onAccept: (invitation: any) => void;
  onBack: () => void;
}

export function AcceptInvite({ token, user, onAccept, onBack }: AcceptInviteProps) {
  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await acceptInvitation(token);
      setInvitation(response.invitation);
    } catch (error: any) {
      console.error('Failed to load invitation:', error);
      setError(error.message || 'Invalid or expired invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);

    try {
      console.log('Accepting invitation...', { token, isAuthenticated: !!user });

      const response = await acceptInvitation(token, user?.accessToken);

      if (response.success) {
        toast.success(`Welcome! You have successfully joined ${invitation.invitedByName}'s family group.`);
        onAccept(invitation);
      } else {
        throw new Error(response.message || 'Failed to accept invitation');
      }
    } catch (error: any) {
      console.error('Accept error:', error);
      toast.error('Failed to accept invitation: ' + error.message);
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Loader2 size={48} className="animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-center">Invalid Invitation</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} variant="outline" className="w-full">
              Back to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'member': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'viewer': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Can manage all subscriptions and members';
      case 'member': return 'Can view and use shared subscriptions';
      case 'viewer': return 'Can only view shared subscriptions';
      default: return '';
    }
  };

  const expiresAt = new Date(invitation.expiresAt);
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-600 dark:to-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus size={40} className="text-white" />
          </div>
          <CardTitle className="text-center text-2xl">You're Invited!</CardTitle>
          <CardDescription className="text-center">
            {invitation.invitedByName} has invited you to join their family sharing group
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Mail size={20} className="text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Invited Email</div>
                  <div className="font-medium">{invitation.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <UserPlus size={20} className="text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Your Role</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getRoleBadgeColor(invitation.role)}>
                      {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getRoleDescription(invitation.role)}
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">What you'll get:</h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Access to shared subscriptions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Split costs with family members
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Track your shared expenses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Save money on subscriptions
                </li>
              </ul>
            </div>

            {/* Expiration Warning */}
            {daysUntilExpiry <= 2 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  ⚠️ This invitation expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleAccept}
              disabled={isAccepting}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              size="lg"
            >
              {isAccepting ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} className="mr-2" />
                  Accept Invitation
                </>
              )}
            </Button>

            <Button onClick={onBack} variant="outline" className="w-full">
              Maybe Later
            </Button>
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              By accepting, you'll join {invitation.invitedByName}'s family group and agree to share subscription costs
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
