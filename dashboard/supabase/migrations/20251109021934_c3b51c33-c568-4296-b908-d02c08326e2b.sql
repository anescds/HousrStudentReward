-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Partners can view their own profile" ON public.partners;
DROP POLICY IF EXISTS "Partners can update their own profile" ON public.partners;
DROP POLICY IF EXISTS "Partners can view their own deals" ON public.deals;
DROP POLICY IF EXISTS "Partners can create deals" ON public.deals;
DROP POLICY IF EXISTS "Partners can update their own deals" ON public.deals;
DROP POLICY IF EXISTS "Partners can delete their own deals" ON public.deals;
DROP POLICY IF EXISTS "Partners can view their deal views" ON public.deal_views;
DROP POLICY IF EXISTS "Partners can view their deal redemptions" ON public.deal_redemptions;

-- Create permissive policies for all tables (no auth required)
CREATE POLICY "Allow all access to partners"
  ON public.partners
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to deals"
  ON public.deals
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to deal_views"
  ON public.deal_views
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to deal_redemptions"
  ON public.deal_redemptions
  FOR ALL
  USING (true)
  WITH CHECK (true);