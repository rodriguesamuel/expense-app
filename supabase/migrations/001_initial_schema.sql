-- PAYMENT TYPES
CREATE TABLE public.payment_types (
  id          UUID        NOT NULL DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  is_system   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payment_types_pkey PRIMARY KEY (id),
  CONSTRAINT payment_types_user_name_unique UNIQUE (user_id, name),
  CONSTRAINT payment_types_name_not_empty CHECK (trim(name) <> '')
);

-- EXPENSES
CREATE TABLE public.expenses (
  id               UUID          NOT NULL DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description      TEXT          NOT NULL,
  amount           NUMERIC(14,2) NOT NULL,
  payment_type_id  UUID          NOT NULL REFERENCES public.payment_types(id),
  date             DATE          NOT NULL DEFAULT CURRENT_DATE,
  notes            TEXT,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_amount_positive CHECK (amount > 0),
  CONSTRAINT expenses_description_not_empty CHECK (trim(description) <> '')
);

-- INDEXES
CREATE INDEX idx_payment_types_user_id ON public.payment_types (user_id);
CREATE INDEX idx_expenses_user_id ON public.expenses (user_id);
CREATE INDEX idx_expenses_user_date ON public.expenses (user_id, date DESC);
CREATE INDEX idx_expenses_payment_type_id ON public.expenses (payment_type_id);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER trg_payment_types_updated_at
  BEFORE UPDATE ON public.payment_types
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- SEED DEFAULT PAYMENT TYPES FOR EVERY NEW USER
CREATE OR REPLACE FUNCTION public.seed_default_payment_types()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.payment_types (user_id, name, is_system) VALUES
    (NEW.id, 'Credit Card', TRUE),
    (NEW.id, 'Debit Card',  TRUE),
    (NEW.id, 'PIX',         TRUE),
    (NEW.id, 'Cash',        TRUE),
    (NEW.id, 'Other',       TRUE);
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_seed_payment_types
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_payment_types();

-- ROW LEVEL SECURITY
ALTER TABLE public.payment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_payment_types" ON public.payment_types
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_payment_types" ON public.payment_types
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_payment_types" ON public.payment_types
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- System defaults cannot be deleted; custom types can
CREATE POLICY "delete_own_custom_payment_types" ON public.payment_types
  FOR DELETE USING (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "select_own_expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- REPORT VIEW: joins expenses with payment type name
CREATE OR REPLACE VIEW public.expenses_with_payment_type AS
  SELECT
    e.id, e.user_id, e.description, e.amount, e.date, e.notes,
    e.created_at, e.updated_at,
    pt.id   AS payment_type_id,
    pt.name AS payment_type_name
  FROM public.expenses e
  JOIN public.payment_types pt ON pt.id = e.payment_type_id;

ALTER VIEW public.expenses_with_payment_type SET (security_invoker = TRUE);

-- KEEPALIVE: run once in Supabase SQL Editor after enabling pg_cron extension
-- SELECT cron.schedule('keepalive', '0 12 */4 * *', 'SELECT 1');
