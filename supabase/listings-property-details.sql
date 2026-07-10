-- Run in Supabase → SQL Editor (once) to add property details to agency listings.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS property_type text NOT NULL DEFAULT 'apartment',
  ADD COLUMN IF NOT EXISTS budget_min numeric,
  ADD COLUMN IF NOT EXISTS budget_max numeric,
  ADD COLUMN IF NOT EXISTS size_min numeric,
  ADD COLUMN IF NOT EXISTS size_max numeric,
  ADD COLUMN IF NOT EXISTS bedrooms integer,
  ADD COLUMN IF NOT EXISTS bathrooms integer,
  ADD COLUMN IF NOT EXISTS amenities jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.listings
SET
  budget_min = price,
  budget_max = price
WHERE budget_min IS NULL OR budget_max IS NULL;

ALTER TABLE public.listings
  ALTER COLUMN budget_min SET DEFAULT 0,
  ALTER COLUMN budget_max SET DEFAULT 0;

UPDATE public.listings SET budget_min = 0 WHERE budget_min IS NULL;
UPDATE public.listings SET budget_max = 0 WHERE budget_max IS NULL;

ALTER TABLE public.listings
  ALTER COLUMN budget_min SET NOT NULL,
  ALTER COLUMN budget_max SET NOT NULL;
