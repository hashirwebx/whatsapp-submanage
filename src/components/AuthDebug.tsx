import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface AuthDebugProps {
  user: any;
}

export function AuthDebug({ user }: AuthDebugProps) {
  const [storageData, setStorageData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('subtrack_user');
    if (stored) {
      try {
        setStorageData(JSON.parse(stored));
      } catch (e) {
        setStorageData({ error: 'Failed to parse' });
      }
    }
  }, [user]);

  const StatusIcon = ({ condition }: { condition: boolean }) => 
    condition ? <CheckCircle2 className="text-green-600" size={20} /> : <XCircle className="text-red-600" size={20} />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Authentication Debug Info</CardTitle>
          <CardDescription>Current authentication state and troubleshooting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <StatusIcon condition={!!user} />
              <span>User object exists</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon condition={!!user?.email} />
              <span>Email present</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon condition={!!user?.accessToken} />
              <span>Access token present</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon condition={user?.isDemo === true} />
              <span>Demo mode</span>
            </div>
          </div>

          {user && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Current User Object:</h3>
              <pre className="text-xs overflow-auto max-h-64">
                {JSON.stringify({
                  ...user,
                  accessToken: user.accessToken ? user.accessToken.substring(0, 30) + '...' : null
                }, null, 2)}
              </pre>
            </div>
          )}

          {storageData && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">localStorage Data:</h3>
              <pre className="text-xs overflow-auto max-h-64">
                {JSON.stringify({
                  ...storageData,
                  accessToken: storageData.accessToken ? storageData.accessToken.substring(0, 30) + '...' : null
                }, null, 2)}
              </pre>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle size={20} className="text-blue-600" />
              Expected for Authenticated Users:
            </h3>
            <ul className="text-sm space-y-1 ml-6 list-disc">
              <li>User object must exist</li>
              <li>Email must be present</li>
              <li>accessToken must be a valid JWT (starts with "eyJ")</li>
              <li>isDemo should be false or undefined</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle size={20} className="text-blue-600" />
              Expected for Demo Mode:
            </h3>
            <ul className="text-sm space-y-1 ml-6 list-disc">
              <li>User object must exist</li>
              <li>isDemo must be true</li>
              <li>accessToken will be null</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => {
                console.log('=== AUTH DEBUG INFO ===');
                console.log('User:', user);
                console.log('localStorage:', storageData);
                console.log('Has accessToken:', !!user?.accessToken);
                console.log('Token preview:', user?.accessToken?.substring(0, 50));
                console.log('Is Demo:', user?.isDemo);
              }}
              variant="outline"
            >
              Log to Console
            </Button>
            <Button 
              onClick={() => {
                localStorage.removeItem('subtrack_user');
                window.location.reload();
              }}
              variant="destructive"
            >
              Clear Session & Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
