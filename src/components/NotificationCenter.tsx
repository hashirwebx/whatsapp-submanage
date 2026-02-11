import { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, Clock, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';

interface Notification {
  id: string;
  user_id: string;
  subscription_id?: string;
  type: 'reminder' | 'alert' | 'info' | 'warning';
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'read';
  whatsapp_message_id?: string;
  metadata?: {
    reminderType?: string;
    daysUntil?: number;
    amount?: number;
    currency?: string;
    error?: any;
  };
  read_at?: string;
  created_at: string;
  updated_at: string;
}

interface NotificationCenterProps {
  accessToken: string;
  userId: string;
}

export function NotificationCenter({ accessToken, userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Load notifications on mount and when opened
  useEffect(() => {
    loadNotifications();
    
    // Set up polling every 30 seconds when sheet is open
    let interval: any;
    if (isOpen) {
      interval = setInterval(loadNotifications, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    // Skip loading if no valid access token (e.g., demo mode)
    if (!accessToken || accessToken === '' || accessToken === 'simulated-token') {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-333e8892/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        
        // Count unread notifications
        const unread = (data.notifications || []).filter((n: Notification) => !n.read_at).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-333e8892/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        // Update local state
        setNotifications(notifications.map(n =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-333e8892/notifications/mark-all-read`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-333e8892/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.status === 'sent') {
      return <CheckCircle2 size={20} className="text-green-600" />;
    } else if (notification.status === 'failed') {
      return <XCircle size={20} className="text-red-600" />;
    } else if (notification.type === 'reminder') {
      return <Clock size={20} className="text-blue-600" />;
    } else if (notification.type === 'alert') {
      return <AlertCircle size={20} className="text-orange-600" />;
    } else {
      return <MessageSquare size={20} className="text-gray-600" />;
    }
  };

  const getNotificationBadgeColor = (notification: Notification) => {
    if (notification.status === 'sent') {
      return 'bg-green-100 text-green-700 border-green-300';
    } else if (notification.status === 'failed') {
      return 'bg-red-100 text-red-700 border-red-300';
    } else {
      return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read_at;
    if (activeTab === 'sent') return n.status === 'sent';
    if (activeTab === 'failed') return n.status === 'failed';
    return true;
  });

  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    failed: notifications.filter(n => n.status === 'failed').length,
    unread: unreadCount,
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            WhatsApp reminders and system notifications
          </SheetDescription>
        </SheetHeader>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-2 mt-4 mb-4">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-xl font-bold">{stats.total}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-xl font-bold text-green-700 dark:text-green-400">{stats.sent}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Sent</div>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-xl font-bold text-red-700 dark:text-red-400">{stats.failed}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Failed</div>
          </div>
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-xl font-bold text-blue-700 dark:text-blue-400">{stats.unread}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Unread</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadNotifications}
            disabled={isLoading}
          >
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 min-w-4 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-[calc(100vh-360px)]">
              {isLoading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Bell size={40} className="mb-2 opacity-20" />
                  <p>Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Bell size={40} className="mb-2 opacity-20" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        notification.read_at
                          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                          : 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium ${!notification.read_at ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            <div className="flex gap-1">
                              {!notification.read_at && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check size={14} />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X size={14} />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getNotificationBadgeColor(notification)}`}
                            >
                              {notification.status}
                            </Badge>
                            {notification.metadata?.daysUntil !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                {notification.metadata.daysUntil === 0
                                  ? 'Today'
                                  : `${notification.metadata.daysUntil}d`}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                          </div>
                          {notification.metadata?.error && (
                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400">
                              Error: {notification.metadata.error.message || 'Unknown error'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}