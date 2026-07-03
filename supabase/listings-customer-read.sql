-- Allow any signed-in user to view listings (needed when agencies share properties in chat).
-- Run in Supabase → SQL Editor.

DROP POLICY IF EXISTS "Customers view listings" ON public.listings;
DROP POLICY IF EXISTS "Authenticated users view listings" ON public.listings;

CREATE POLICY "Authenticated users view listings"
ON public.listings FOR SELECT TO authenticated
USING (true);
