ALTER TABLE public.payment_types
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS cutoff_day INTEGER,
  ADD COLUMN IF NOT EXISTS due_day INTEGER;

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS payment_date DATE;

UPDATE public.expenses SET payment_date = date WHERE payment_date IS NULL;

ALTER TABLE public.expenses
  ALTER COLUMN payment_date SET NOT NULL;

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS installment_group_id UUID,
  ADD COLUMN IF NOT EXISTS installment_number INTEGER,
  ADD COLUMN IF NOT EXISTS installment_count INTEGER;

UPDATE public.payment_types
SET type = 'credit_card'
WHERE lower(name) IN ('credit card', 'cartão de crédito');

CREATE OR REPLACE FUNCTION public.seed_default_payment_types()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.payment_types (user_id, name, is_system, type) VALUES
    (NEW.id, 'Credit Card', TRUE, 'credit_card'),
    (NEW.id, 'Debit Card', TRUE, 'other'),
    (NEW.id, 'PIX', TRUE, 'other'),
    (NEW.id, 'Cash', TRUE, 'other'),
    (NEW.id, 'Other', TRUE, 'other');
  RETURN NEW;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_expenses_user_payment_date
  ON public.expenses (user_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_installment_group
  ON public.expenses (installment_group_id);

ALTER TABLE public.payment_types
  ADD CONSTRAINT payment_types_type_check
  CHECK (type IN ('credit_card', 'other'));
ALTER TABLE public.payment_types
  ADD CONSTRAINT payment_types_cutoff_day_check
  CHECK (cutoff_day IS NULL OR cutoff_day BETWEEN 1 AND 31);
ALTER TABLE public.payment_types
  ADD CONSTRAINT payment_types_due_day_check
  CHECK (due_day IS NULL OR due_day BETWEEN 1 AND 31);
ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_installment_number_check
  CHECK (installment_number IS NULL OR installment_number > 0);
ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_installment_count_check
  CHECK (installment_count IS NULL OR installment_count > 0);

CREATE OR REPLACE FUNCTION public.create_expense_installments(
  p_user_id UUID,
  p_description TEXT,
  p_total_amount NUMERIC,
  p_payment_type_id UUID,
  p_category_id UUID,
  p_purchase_date DATE,
  p_notes TEXT,
  p_payment_dates DATE[],
  p_amounts NUMERIC[]
) RETURNS SETOF public.expenses
LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_group UUID := CASE WHEN array_length(p_payment_dates, 1) > 1 THEN gen_random_uuid() ELSE NULL END;
  v_index INTEGER;
BEGIN
  IF array_length(p_payment_dates, 1) IS DISTINCT FROM array_length(p_amounts, 1)
     OR array_length(p_payment_dates, 1) IS NULL THEN
    RAISE EXCEPTION 'Invalid installment arrays';
  END IF;

  FOR v_index IN 1..array_length(p_payment_dates, 1) LOOP
    RETURN QUERY
    INSERT INTO public.expenses (
      user_id, description, amount, payment_type_id, category_id, date,
      payment_date, notes, installment_group_id, installment_number, installment_count
    ) VALUES (
      p_user_id, p_description, p_amounts[v_index], p_payment_type_id, p_category_id,
      p_purchase_date, p_payment_dates[v_index], p_notes, v_group, v_index,
      array_length(p_payment_dates, 1)
    )
    RETURNING *;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.replace_expense_installments(
  p_user_id UUID,
  p_group_id UUID,
  p_description TEXT,
  p_payment_type_id UUID,
  p_category_id UUID,
  p_purchase_date DATE,
  p_notes TEXT,
  p_payment_dates DATE[],
  p_amounts NUMERIC[]
) RETURNS SETOF public.expenses
LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.expenses
    WHERE user_id = p_user_id AND installment_group_id = p_group_id
  ) THEN
    RAISE EXCEPTION 'Installment series not found';
  END IF;

  DELETE FROM public.expenses
  WHERE user_id = p_user_id AND installment_group_id = p_group_id;

  RETURN QUERY
  SELECT * FROM public.create_expense_installments(
    p_user_id, p_description, p_amounts[1] * array_length(p_amounts, 1),
    p_payment_type_id, p_category_id, p_purchase_date, p_notes,
    p_payment_dates, p_amounts
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_expense_series(
  p_user_id UUID,
  p_expense_id UUID
) RETURNS VOID LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_group UUID;
BEGIN
  SELECT installment_group_id INTO v_group
  FROM public.expenses
  WHERE id = p_expense_id AND user_id = p_user_id;

  IF v_group IS NULL THEN
    DELETE FROM public.expenses WHERE id = p_expense_id AND user_id = p_user_id;
  ELSE
    DELETE FROM public.expenses
    WHERE user_id = p_user_id AND installment_group_id = v_group;
  END IF;
END;
$$;

DROP VIEW IF EXISTS public.expenses_with_payment_type;
CREATE VIEW public.expenses_with_payment_type AS
  SELECT
    e.id, e.user_id, e.description, e.amount, e.date, e.payment_date, e.notes,
    e.installment_group_id, e.installment_number, e.installment_count,
    e.created_at, e.updated_at,
    pt.id AS payment_type_id, pt.name AS payment_type_name,
    pt.type AS payment_type_kind, pt.cutoff_day, pt.due_day,
    c.id AS category_id, c.name AS category_name
  FROM public.expenses e
  JOIN public.payment_types pt ON pt.id = e.payment_type_id
  LEFT JOIN public.categories c ON c.id = e.category_id;

ALTER VIEW public.expenses_with_payment_type SET (security_invoker = TRUE);
