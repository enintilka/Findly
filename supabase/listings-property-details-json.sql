-- Run in Supabase → SQL Editor (once) to store property-type-specific listing details.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS property_details jsonb NOT NULL DEFAULT '{}'::jsonb;
