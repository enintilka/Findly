-- Run in Supabase → SQL Editor (once) to allow agencies to delete listing photos from storage.
-- Table DELETE is already covered by "Agencies manage own listings" in setup-platform.sql.

DROP POLICY IF EXISTS "Agencies delete own listing images" ON storage.objects;

CREATE POLICY "Agencies delete own listing images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'listing-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
