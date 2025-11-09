-- Create partners table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_percentage INTEGER NOT NULL,
  discount_amount DECIMAL(10, 2),
  terms TEXT,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_to TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deal_views table to track when students view deals
CREATE TABLE public.deal_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deal_redemptions table to track when students redeem deals
CREATE TABLE public.deal_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_redemptions ENABLE ROW LEVEL SECURITY;

-- Create policies for partners (partners can only see their own data)
CREATE POLICY "Partners can view their own profile"
  ON public.partners
  FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Partners can update their own profile"
  ON public.partners
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Create policies for deals (partners can manage their own deals)
CREATE POLICY "Partners can view their own deals"
  ON public.deals
  FOR SELECT
  USING (partner_id::text = auth.uid()::text);

CREATE POLICY "Partners can create deals"
  ON public.deals
  FOR INSERT
  WITH CHECK (partner_id::text = auth.uid()::text);

CREATE POLICY "Partners can update their own deals"
  ON public.deals
  FOR UPDATE
  USING (partner_id::text = auth.uid()::text);

CREATE POLICY "Partners can delete their own deals"
  ON public.deals
  FOR DELETE
  USING (partner_id::text = auth.uid()::text);

-- Create policies for deal_views (partners can see views of their deals)
CREATE POLICY "Partners can view their deal views"
  ON public.deal_views
  FOR SELECT
  USING (
    deal_id IN (
      SELECT id FROM public.deals WHERE partner_id::text = auth.uid()::text
    )
  );

-- Create policies for deal_redemptions (partners can see redemptions of their deals)
CREATE POLICY "Partners can view their deal redemptions"
  ON public.deal_redemptions
  FOR SELECT
  USING (
    deal_id IN (
      SELECT id FROM public.deals WHERE partner_id::text = auth.uid()::text
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_deals_partner_id ON public.deals(partner_id);
CREATE INDEX idx_deals_status ON public.deals(status);
CREATE INDEX idx_deal_views_deal_id ON public.deal_views(deal_id);
CREATE INDEX idx_deal_views_student_id ON public.deal_views(student_id);
CREATE INDEX idx_deal_redemptions_deal_id ON public.deal_redemptions(deal_id);
CREATE INDEX idx_deal_redemptions_student_id ON public.deal_redemptions(student_id);