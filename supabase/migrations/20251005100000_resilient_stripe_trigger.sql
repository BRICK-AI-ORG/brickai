-- Make Stripe customer creation trigger resilient so Auth signups never fail
-- If the Stripe FDW/server/table is not configured or any error occurs,
-- skip silently and allow profile creation to proceed.

CREATE OR REPLACE FUNCTION public.handle_stripe_customer_creation()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_email text;
  stripe_customers_reg regclass;
BEGIN
  -- Wrap the entire integration in a safe block to avoid failing profile insert
  BEGIN
    -- Get user email from auth.users
    SELECT email INTO customer_email
    FROM auth.users
    WHERE id = NEW.user_id;

    -- If no email, nothing to do
    IF customer_email IS NULL THEN
      RETURN NEW;
    END IF;

    -- Ensure the foreign table exists; if not, skip
    SELECT 'stripe.customers'::regclass INTO stripe_customers_reg;
    IF stripe_customers_reg IS NULL THEN
      RETURN NEW;
    END IF;

    -- Try to create a Stripe customer via FDW. If this fails, swallow and continue.
    BEGIN
      INSERT INTO stripe.customers (email, name)
      VALUES (customer_email, NEW.name);

      -- Best-effort fetch of created customer id
      BEGIN
        SELECT id INTO NEW.stripe_customer_id
        FROM stripe.customers
        WHERE email = customer_email
        ORDER BY created DESC
        LIMIT 1;
      EXCEPTION WHEN OTHERS THEN
        -- ignore fetch errors
        NULL;
      END;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore Stripe FDW errors (e.g., missing secret or network)
      RAISE NOTICE 'Stripe creation skipped: %', SQLERRM;
    END;
  EXCEPTION WHEN OTHERS THEN
    -- Any unexpected error should not block profile creation
    RAISE NOTICE 'Stripe integration skipped due to: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

