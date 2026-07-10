-- Run in Supabase → SQL Editor (once) to allow customers to delete their requests.

DROP POLICY IF EXISTS "Customers delete own requests" ON public.requests;

CREATE POLICY "Customers delete own requests"
ON public.requests FOR DELETE TO authenticated
USING (
  customer_id = auth.uid()
  AND public.current_user_role() = 'customer'
);

GRANT DELETE ON public.requests TO authenticated;

-- Allow customers to remove uploaded request images from storage.
DROP POLICY IF EXISTS "Customers delete own request images" ON storage.objects;

CREATE POLICY "Customers delete own request images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'request-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
