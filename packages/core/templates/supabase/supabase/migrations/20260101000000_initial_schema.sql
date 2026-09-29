-- ==============================================================================
-- CodersTrim Supabase Initial Migration Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- ⚠️ SECURITY WARNING (DEMO ACCESS POLICY):
-- The policy below permits public read access for early testing & demonstration.
-- Replace with authenticated role checks (e.g. auth.uid() = user_id) before
-- deploying to a production Supabase instance!
-- ==============================================================================
CREATE POLICY "Public read demo" ON public.items FOR SELECT USING (true);
