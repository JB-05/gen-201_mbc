-- Refine RLS policies for configuration and districts to avoid overlapping permissive SELECT

-- Configuration table: keep public SELECT, restrict admin writes per action
DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Allow admin write access to configuration" ON public.configuration';
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Explicit admin write policies
CREATE POLICY "Admin insert configuration" ON public.configuration
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update configuration" ON public.configuration
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete configuration" ON public.configuration
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Districts table: keep public SELECT, restrict admin writes per action
DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Allow admin write access to districts" ON public.districts';
EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "Admin insert districts" ON public.districts
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update districts" ON public.districts
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete districts" ON public.districts
  FOR DELETE TO authenticated
  USING (public.is_admin());






