-- Create USSD Sessions Table
CREATE TABLE IF NOT EXISTS public.ussd_sessions (
  session_id text PRIMARY KEY,
  phone_number text NOT NULL,
  state text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS (Optional, since backend uses service_role key)
ALTER TABLE public.ussd_sessions ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage USSD sessions
CREATE POLICY "Service role has full access to ussd_sessions" ON public.ussd_sessions
  USING (true)
  WITH CHECK (true);
