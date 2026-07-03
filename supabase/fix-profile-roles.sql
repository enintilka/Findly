-- Run once in Supabase → SQL Editor after setup-profiles.sql
-- Fixes role detection: reads account_type from auth metadata (not JWT "role").

CREATE OR REPLACE FUNCTION public.profile_role_from_metadata(metadata jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN COALESCE(metadata ->> 'account_type', metadata ->> 'role') IN ('customer', 'agency')
      THEN COALESCE(metadata ->> 'account_type', metadata ->> 'role')
    ELSE 'customer'
  END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_role text;
BEGIN
  resolved_role := public.profile_role_from_metadata(NEW.raw_user_meta_data);

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    resolved_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE
      WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name
      ELSE public.profiles.full_name
    END,
    role = CASE
      WHEN public.profiles.role IS NULL OR public.profiles.role = 'customer'
        THEN EXCLUDED.role
      ELSE public.profiles.role
    END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Sync existing profiles from auth metadata where possible
UPDATE public.profiles p
SET role = public.profile_role_from_metadata(u.raw_user_meta_data)
FROM auth.users u
WHERE p.id = u.id
  AND public.profile_role_from_metadata(u.raw_user_meta_data) IN ('customer', 'agency')
  AND (
    p.role IS NULL
    OR (
      p.role = 'customer'
      AND public.profile_role_from_metadata(u.raw_user_meta_data) = 'agency'
    )
  );

-- Manual fix: set agency accounts that still show as customer (edit emails as needed)
-- UPDATE public.profiles SET role = 'agency' WHERE email = 'your-agency@email.com';
