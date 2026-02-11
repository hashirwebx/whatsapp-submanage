import { useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Terminal, Database, Key, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function WhatsAppSetupGuide() {
  const [showGuide, setShowGuide] = useState(true);

  if (!showGuide) return null;

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <CardTitle className="text-orange-900 dark:text-orange-100">
              WhatsApp Setup Required
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(false)}
            className="text-orange-600 hover:text-orange-700"
          >
            Dismiss
          </Button>
        </div>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          To enable WhatsApp verification, please complete the following setup steps:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1 */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 dark:bg-orange-700 text-white flex items-center justify-center text-sm font-bold">
            1
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Terminal className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                Deploy Supabase Edge Functions
              </h4>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
              Deploy the WhatsApp verification functions to Supabase:
            </p>
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded p-3 font-mono text-xs">
              <div className="text-orange-900 dark:text-orange-100">
                # Login and link project
              </div>
              <div className="text-orange-800 dark:text-orange-200">
                supabase login
              </div>
              <div className="text-orange-800 dark:text-orange-200">
                supabase link --project-ref kkffwzvyfbkhhoxztsgn
              </div>
              <div className="text-orange-900 dark:text-orange-100 mt-2">
                # Deploy functions
              </div>
              <div className="text-orange-800 dark:text-orange-200">
                supabase functions deploy send-whatsapp-verification
              </div>
              <div className="text-orange-800 dark:text-orange-200">
                supabase functions deploy verify-whatsapp-code
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 dark:bg-orange-700 text-white flex items-center justify-center text-sm font-bold">
            2
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Key className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                Set WhatsApp API Secrets
              </h4>
              <Badge variant="outline" className="ml-auto border-green-600 text-green-700 dark:text-green-400">
                Already Set ✓
              </Badge>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              You mentioned these are already configured in Supabase. Great! ✓
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 dark:bg-orange-700 text-white flex items-center justify-center text-sm font-bold">
            3
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                Create Database Table
              </h4>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
              Run the SQL migration in Supabase Dashboard → SQL Editor
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-orange-700 border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/20"
              onClick={() => {
                window.open('https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn/sql', '_blank');
              }}
            >
              <ExternalLink className="mr-2 h-3 w-3" />
              Open SQL Editor
            </Button>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              Copy SQL from: <code className="bg-orange-200 dark:bg-orange-900/40 px-1 rounded">/supabase/migrations/create_whatsapp_verifications_table.sql</code>
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-3 border-t border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <h4 className="font-semibold text-orange-900 dark:text-orange-100 text-sm">
              Quick Links
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-orange-700 border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/20"
              onClick={() => {
                window.open('https://supabase.com/dashboard/project/kkffwzvyfbkhhoxztsgn', '_blank');
              }}
            >
              <ExternalLink className="mr-2 h-3 w-3" />
              Supabase Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-orange-700 border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/20"
              onClick={() => {
                // Open the quick start guide
                const link = document.createElement('a');
                link.href = '/WHATSAPP_QUICK_START.md';
                link.download = 'WHATSAPP_QUICK_START.md';
                link.click();
              }}
            >
              📄 Quick Start Guide
            </Button>
          </div>
        </div>

        {/* Info */}
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Note:</strong> Once you complete these steps, this guide will automatically disappear and WhatsApp verification will work seamlessly!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
