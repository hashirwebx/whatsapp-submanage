-- Create whatsapp_verifications table for storing verification codes
CREATE TABLE IF NOT EXISTS public.whatsapp_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    failed_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_verification UNIQUE (user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_whatsapp_verifications_user_id ON public.whatsapp_verifications(user_id);
CREATE INDEX idx_whatsapp_verifications_phone ON public.whatsapp_verifications(phone_number);
CREATE INDEX idx_whatsapp_verifications_expires ON public.whatsapp_verifications(expires_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own verification records
CREATE POLICY "Users can view own verifications"
    ON public.whatsapp_verifications
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own verification records
CREATE POLICY "Users can create own verifications"
    ON public.whatsapp_verifications
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own verification records
CREATE POLICY "Users can update own verifications"
    ON public.whatsapp_verifications
    FOR UPDATE
    USING (auth.uid()::text = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_whatsapp_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_whatsapp_verifications_timestamp
    BEFORE UPDATE ON public.whatsapp_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_verifications_updated_at();

-- Function to clean up expired verification codes (run daily)
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS void AS $$
BEGIN
    DELETE FROM public.whatsapp_verifications
    WHERE expires_at < NOW() - INTERVAL '24 hours'
    AND verified = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to service role
GRANT ALL ON public.whatsapp_verifications TO service_role;
GRANT ALL ON public.whatsapp_verifications TO authenticated;

-- Comment on table
COMMENT ON TABLE public.whatsapp_verifications IS 'Stores WhatsApp verification codes for phone number verification';
