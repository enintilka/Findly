-- Run once in Supabase → SQL Editor
-- Creates platform tables, RLS policies, and storage buckets.

-- Helper: check role from profiles (safe for RLS)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ─── REQUESTS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  introduction text NOT NULL,
  property_type text NOT NULL,
  country text NOT NULL,
  region text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  budget_min numeric NOT NULL,
  budget_max numeric NOT NULL,
  size_min numeric,
  size_max numeric,
  bedrooms integer,
  bathrooms integer,
  amenities jsonb NOT NULL DEFAULT '{}'::jsonb,
  additional_notes text,
  pdf_names text[] NOT NULL DEFAULT '{}',
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS requests_customer_id_idx ON public.requests(customer_id);
CREATE INDEX IF NOT EXISTS requests_status_idx ON public.requests(status);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers insert own requests" ON public.requests;
DROP POLICY IF EXISTS "Customers select own requests" ON public.requests;
DROP POLICY IF EXISTS "Customers update own requests" ON public.requests;
DROP POLICY IF EXISTS "Agencies view open requests" ON public.requests;

CREATE POLICY "Customers insert own requests"
ON public.requests FOR INSERT TO authenticated
WITH CHECK (
  customer_id = auth.uid()
  AND public.current_user_role() = 'customer'
);

CREATE POLICY "Customers select own requests"
ON public.requests FOR SELECT TO authenticated
USING (customer_id = auth.uid());

CREATE POLICY "Customers update own requests"
ON public.requests FOR UPDATE TO authenticated
USING (customer_id = auth.uid())
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Agencies view open requests"
ON public.requests FOR SELECT TO authenticated
USING (
  status = 'open'
  AND public.current_user_role() = 'agency'
);

GRANT SELECT, INSERT, UPDATE ON public.requests TO authenticated;

-- ─── SAVED REQUESTS ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.saved_requests (
  agency_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  saved_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (agency_id, request_id)
);

ALTER TABLE public.saved_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agencies manage saved requests" ON public.saved_requests;

CREATE POLICY "Agencies manage saved requests"
ON public.saved_requests FOR ALL TO authenticated
USING (agency_id = auth.uid() AND public.current_user_role() = 'agency')
WITH CHECK (agency_id = auth.uid() AND public.current_user_role() = 'agency');

GRANT SELECT, INSERT, DELETE ON public.saved_requests TO authenticated;

-- ─── LISTINGS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  city text NOT NULL DEFAULT '',
  country text NOT NULL,
  price numeric NOT NULL,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listings_agency_id_idx ON public.listings(agency_id);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agencies manage own listings" ON public.listings;

CREATE POLICY "Agencies manage own listings"
ON public.listings FOR ALL TO authenticated
USING (agency_id = auth.uid() AND public.current_user_role() = 'agency')
WITH CHECK (agency_id = auth.uid() AND public.current_user_role() = 'agency');

DROP POLICY IF EXISTS "Customers view listings" ON public.listings;
DROP POLICY IF EXISTS "Authenticated users view listings" ON public.listings;

CREATE POLICY "Authenticated users view listings"
ON public.listings FOR SELECT TO authenticated
USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;

-- ─── CHAT ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  request_title text NOT NULL,
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  agency_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_name text NOT NULL,
  last_message text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  customer_last_read_at timestamptz,
  agency_last_read_at timestamptz,
  deleted_by_customer boolean NOT NULL DEFAULT false,
  deleted_by_agency boolean NOT NULL DEFAULT false,
  UNIQUE (request_id, agency_id)
);

CREATE INDEX IF NOT EXISTS chat_threads_customer_idx ON public.chat_threads(customer_id);
CREATE INDEX IF NOT EXISTS chat_threads_agency_idx ON public.chat_threads(agency_id);

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants manage chat threads" ON public.chat_threads;

CREATE POLICY "Participants manage chat threads"
ON public.chat_threads FOR ALL TO authenticated
USING (customer_id = auth.uid() OR agency_id = auth.uid())
WITH CHECK (customer_id = auth.uid() OR agency_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.chat_threads TO authenticated;

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('customer', 'agency')),
  body text NOT NULL DEFAULT '',
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  sent_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  read_at timestamptz,
  status text NOT NULL DEFAULT 'delivered' CHECK (status IN ('sent', 'delivered', 'read'))
);

CREATE INDEX IF NOT EXISTS chat_messages_thread_idx ON public.chat_messages(thread_id);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants read messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Participants send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Participants update messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Participants delete own messages" ON public.chat_messages;

CREATE POLICY "Participants read messages"
ON public.chat_messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_threads t
    WHERE t.id = thread_id
      AND (t.customer_id = auth.uid() OR t.agency_id = auth.uid())
  )
);

CREATE POLICY "Participants send messages"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.chat_threads t
    WHERE t.id = thread_id
      AND (t.customer_id = auth.uid() OR t.agency_id = auth.uid())
  )
);

CREATE POLICY "Participants update messages"
ON public.chat_messages FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_threads t
    WHERE t.id = thread_id
      AND (t.customer_id = auth.uid() OR t.agency_id = auth.uid())
  )
);

CREATE POLICY "Participants delete own messages"
ON public.chat_messages FOR DELETE TO authenticated
USING (sender_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;

-- ─── STORAGE BUCKETS ────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('request-images', 'request-images', true),
  ('listing-images', 'listing-images', true),
  ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated upload request images" ON storage.objects;
DROP POLICY IF EXISTS "Public read request images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Public read listing images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload chat attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public read chat attachments" ON storage.objects;

CREATE POLICY "Authenticated upload request images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'request-images');

CREATE POLICY "Public read request images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'request-images');

CREATE POLICY "Authenticated upload listing images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'listing-images');

CREATE POLICY "Public read listing images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated upload chat attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

CREATE POLICY "Public read chat attachments"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'chat-attachments');
