-- Run in Supabase → SQL Editor (once) to store property-type-specific request details.

ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS property_details jsonb NOT NULL DEFAULT '{}'::jsonb;
