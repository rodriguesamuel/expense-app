-- CATEGORIES
CREATE TABLE public.categories (
  id          UUID        NOT NULL DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_user_name_unique UNIQUE (user_id, name),
  CONSTRAINT categories_name_not_empty CHECK (trim(name) <> '')
);

ALTER TABLE public.expenses
  ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- MONTHLY CATEGORY BUDGETS
CREATE TABLE public.budgets (
  id          UUID          NOT NULL DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID          NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  month       DATE          NOT NULL,
  amount      NUMERIC(14,2) NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT budgets_pkey PRIMARY KEY (id),
  CONSTRAINT budgets_category_month_unique UNIQUE (category_id, month),
  CONSTRAINT budgets_amount_positive CHECK (amount > 0),
  CONSTRAINT budgets_month_first_day CHECK (month = date_trunc('month', month)::date)
);

CREATE INDEX idx_categories_user_id ON public.categories (user_id);
CREATE INDEX idx_expenses_category_id ON public.expenses (category_id);
CREATE INDEX idx_budgets_user_month ON public.budgets (user_id, month);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "select_own_budgets" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

DROP VIEW public.expenses_with_payment_type;
CREATE VIEW public.expenses_with_payment_type AS
  SELECT
    e.id, e.user_id, e.description, e.amount, e.date, e.notes,
    e.created_at, e.updated_at,
    pt.id AS payment_type_id,
    pt.name AS payment_type_name,
    e.category_id,
    c.name AS category_name
  FROM public.expenses e
  JOIN public.payment_types pt ON pt.id = e.payment_type_id
  LEFT JOIN public.categories c ON c.id = e.category_id;

ALTER VIEW public.expenses_with_payment_type SET (security_invoker = TRUE);
