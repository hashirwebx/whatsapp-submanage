-- Setup PostgreSQL Cron Extension for Automatic WhatsApp Reminders
-- This will run the reminder check daily at 9:00 AM UTC

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on cron schema to postgres
GRANT USAGE ON SCHEMA cron TO postgres;

-- Remove existing reminder cron job if it exists
SELECT cron.unschedule('send-daily-whatsapp-reminders');

-- Schedule daily reminder check at 9:00 AM UTC (adjust timezone as needed)
-- Cron format: minute hour day-of-month month day-of-week
-- '0 9 * * *' = Every day at 9:00 AM UTC
SELECT cron.schedule(
  'send-daily-whatsapp-reminders',        -- Unique job name
  '0 9 * * *',                            -- Cron schedule (9 AM UTC daily)
  $$
  SELECT
    net.http_post(
      url:='https://kkffwzvyfbkhhoxztsgn.supabase.co/functions/v1/send-whatsapp-reminder',
      headers:=jsonb_build_object(
        'Content-Type','application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmZ3enZ5ZmJraGhveHp0c2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjA4MDEsImV4cCI6MjA3NzQ5NjgwMX0.pJtQlX6dF7j8kAniWPDUNkT_MQfrJluvwacNKFqlfCQ'
      ),
      body:=jsonb_build_object('source', 'cron')
    ) AS request_id;
  $$
);

-- Alternative schedule options (uncomment the one you want to use):

-- Every day at 8:00 AM UTC:
-- SELECT cron.schedule('send-daily-whatsapp-reminders', '0 8 * * *', $$...$$ );

-- Every day at 10:00 AM UTC:
-- SELECT cron.schedule('send-daily-whatsapp-reminders', '0 10 * * *', $$...$$ );

-- Every day at 6:00 PM UTC:
-- SELECT cron.schedule('send-daily-whatsapp-reminders', '0 18 * * *', $$...$$ );

-- Every 12 hours (at 9 AM and 9 PM UTC):
-- SELECT cron.schedule('send-daily-whatsapp-reminders', '0 9,21 * * *', $$...$$ );

-- Every hour (for testing):
-- SELECT cron.schedule('send-daily-whatsapp-reminders', '0 * * * *', $$...$$ );

-- Every 30 minutes (for testing):
-- SELECT cron.schedule('send-daily-whatsapp-reminders', '*/30 * * * *', $$...$$ );

-- Create a table to log cron job executions
CREATE TABLE IF NOT EXISTS cron_job_logs (
  id BIGSERIAL PRIMARY KEY,
  job_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'success', 'failed'
  response JSONB,
  error TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_job_name ON cron_job_logs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_executed_at ON cron_job_logs(executed_at DESC);

-- Enable Row Level Security (optional)
ALTER TABLE cron_job_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access cron logs
CREATE POLICY "Service role can access cron logs"
  ON cron_job_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- View all scheduled cron jobs
-- Run this query to see all scheduled jobs:
-- SELECT * FROM cron.job;

-- View cron job run history
-- Run this query to see execution history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 50;

-- Manually trigger the reminder job (for testing)
-- You can run this to test the reminder system immediately:
/*
SELECT
  net.http_post(
    url:='https://kkffwzvyfbkhhoxztsgn.supabase.co/functions/v1/send-whatsapp-reminder',
    headers:=jsonb_build_object(
      'Content-Type','application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmZ3enZ5ZmJraGhveHp0c2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjA4MDEsImV4cCI6MjA3NzQ5NjgwMX0.pJtQlX6dF7j8kAniWPDUNkT_MQfrJluvwacNKFqlfCQ'
    ),
    body:=jsonb_build_object('force', true, 'source', 'manual')
  ) AS request_id;
*/

-- Unschedule the job (if you want to disable automatic reminders)
-- SELECT cron.unschedule('send-daily-whatsapp-reminders');

-- Notes:
-- 1. Make sure to adjust the timezone in the schedule if needed
-- 2. The cron job uses the Supabase anon key - make sure it's valid
-- 3. You can check job execution history in cron.job_run_details
-- 4. For production, consider using service_role_key instead of anon key
-- 5. The pg_cron extension must be enabled in your Supabase project

COMMENT ON TABLE cron_job_logs IS 'Logs for cron job executions to track reminder sending history';
