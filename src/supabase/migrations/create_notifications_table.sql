-- Create notifications table for tracking WhatsApp reminders and other notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID,
  type VARCHAR(50) NOT NULL, -- 'reminder', 'alert', 'info', 'warning'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'read'
  whatsapp_message_id VARCHAR(255), -- WhatsApp message ID for tracking
  metadata JSONB, -- Additional data like reminder type, error details, etc.
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for fast queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create index on subscription_id for subscription-specific queries
CREATE INDEX IF NOT EXISTS idx_notifications_subscription_id ON notifications(subscription_id);

-- Create index on type for filtering by notification type
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Create index on status for filtering by status
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- Create index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create compound index for user + unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, status) WHERE read_at IS NULL;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Service role can insert notifications (for background jobs)
CREATE POLICY "Service role can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS set_notifications_updated_at ON notifications;
CREATE TRIGGER set_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Insert sample notification for testing (optional - can be removed)
-- This will fail if no users exist, which is fine
DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  -- Try to get a user ID (this may fail if no users exist)
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, status)
    VALUES (
      sample_user_id,
      'info',
      'Welcome to SubTrack Pro',
      'Your notification system is now active! You will receive WhatsApp reminders for upcoming subscription payments.',
      'sent'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if no users exist
    NULL;
END $$;

-- Create a view for notification summaries (useful for dashboard)
CREATE OR REPLACE VIEW notification_summary AS
SELECT 
  user_id,
  COUNT(*) AS total_notifications,
  COUNT(*) FILTER (WHERE status = 'sent') AS sent_count,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
  COUNT(*) FILTER (WHERE read_at IS NULL) AS unread_count,
  COUNT(*) FILTER (WHERE type = 'reminder' AND status = 'sent') AS reminders_sent,
  MAX(created_at) AS last_notification_at
FROM notifications
GROUP BY user_id;

-- Grant access to the view
GRANT SELECT ON notification_summary TO authenticated;
GRANT SELECT ON notification_summary TO service_role;

COMMENT ON TABLE notifications IS 'Stores all system notifications including WhatsApp reminders, alerts, and messages';
COMMENT ON COLUMN notifications.metadata IS 'JSON object containing additional data like reminder type, error details, amounts, etc.';
COMMENT ON COLUMN notifications.whatsapp_message_id IS 'WhatsApp message ID returned by the API for tracking delivery status';
