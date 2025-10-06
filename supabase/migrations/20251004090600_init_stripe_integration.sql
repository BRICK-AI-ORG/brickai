--
-- Stripe FDW setup is optional and depends on the
-- availability of the `wrappers` extension with the
-- `stripe_fdw_handler` symbol on the target Postgres.
--
-- On many Supabase projects, Stripe integration is handled
-- via Edge Functions and webhooks (see supabase/functions),
-- so we gracefully skip FDW setup when unavailable.
--

DO $do$
DECLARE
  wrappers_ok boolean := false;
BEGIN
  -- Detect `wrappers` availability and attempt to enable it
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'wrappers') THEN
    BEGIN
      CREATE EXTENSION IF NOT EXISTS wrappers WITH SCHEMA extensions;
      wrappers_ok := true;
    EXCEPTION
      WHEN undefined_object THEN
        RAISE NOTICE 'wrappers not installable on this server; skipping Stripe FDW setup';
        wrappers_ok := false;
      WHEN insufficient_privilege THEN
        RAISE NOTICE 'insufficient privilege to create wrappers; skipping Stripe FDW setup';
        wrappers_ok := false;
      WHEN OTHERS THEN
        RAISE NOTICE 'error enabling wrappers: %; skipping Stripe FDW setup', SQLERRM;
        wrappers_ok := false;
    END;
  ELSE
    RAISE NOTICE 'wrappers extension not available; skipping Stripe FDW setup';
    wrappers_ok := false;
  END IF;

  -- Attempt FDW creation only if handler exists with correct signature
  IF wrappers_ok THEN
    DECLARE
      handler_schema text;
      handler_name   text;
      handler_qual   text;
      server_ready   boolean := false;
      customers_table_ready boolean := false;
    BEGIN
      SELECT n.nspname, p.proname
      INTO handler_schema, handler_name
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE p.proname = 'stripe_fdw_handler'
        AND p.pronargs = 0
        AND p.prorettype = 'fdw_handler'::regtype
      LIMIT 1;

      IF handler_schema IS NOT NULL THEN
      handler_qual := quote_ident(handler_schema) || '.' || quote_ident(handler_name);

      -- Create FDW (idempotent). Omit VALIDATOR to avoid missing symbol.
      BEGIN
        EXECUTE format('CREATE FOREIGN DATA WRAPPER stripe_wrapper HANDLER %s', handler_qual);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN undefined_function THEN
          RAISE NOTICE 'Stripe FDW handler missing; skipping Stripe FDW setup';
      END;

        -- Proceed only if the FDW now exists
        IF EXISTS (
          SELECT 1 FROM pg_foreign_data_wrapper WHERE fdwname = 'stripe_wrapper'
        ) THEN
      -- Create server (idempotent)
      BEGIN
        CREATE SERVER stripe_server
        FOREIGN DATA WRAPPER stripe_wrapper
        OPTIONS (api_key_name 'stripe');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN insufficient_privilege THEN
          RAISE NOTICE 'insufficient privilege to create foreign server; skipping';
        WHEN OTHERS THEN
          RAISE NOTICE 'skipping server creation due to: %', SQLERRM;
      END;

      -- Check server availability
      SELECT EXISTS (
        SELECT 1 FROM pg_foreign_server WHERE srvname = 'stripe_server'
      ) INTO server_ready;

      -- Schema for foreign tables
      CREATE SCHEMA IF NOT EXISTS stripe;

      -- Customers foreign table (only when server exists)
      IF server_ready THEN
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'stripe' AND table_name = 'customers'
          ) THEN
            EXECUTE $$
              CREATE FOREIGN TABLE stripe.customers (
                id text,
                email text,
                name text,
                description text,
                created timestamp,
                attrs jsonb
              )
              SERVER stripe_server
              OPTIONS (
                object 'customers',
                rowid_column 'id'
              )
            $$;
          END IF;
        EXCEPTION
          WHEN insufficient_privilege THEN
            RAISE NOTICE 'insufficient privilege to create foreign table; skipping';
          WHEN OTHERS THEN
            RAISE NOTICE 'skipping foreign table creation due to: %', SQLERRM;
        END;
      END IF;

      -- Check foreign table availability
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'stripe' AND table_name = 'customers'
      ) INTO customers_table_ready;

      -- Only add functions/triggers if the foreign table is present
      IF customers_table_ready THEN
        -- Function to handle Stripe customer creation
        CREATE OR REPLACE FUNCTION public.handle_stripe_customer_creation()
        RETURNS trigger
        SECURITY DEFINER
        SET search_path = public
        AS $$
        DECLARE
          customer_email text;
        BEGIN
          -- Get user email
          SELECT email INTO customer_email
          FROM auth.users
          WHERE id = NEW.user_id;

          -- Create Stripe customer
          INSERT INTO stripe.customers (email, name)
          VALUES (customer_email, NEW.name);
          
          -- Get the created customer ID from Stripe
          SELECT id INTO NEW.stripe_customer_id
          FROM stripe.customers
          WHERE email = customer_email
          ORDER BY created DESC
          LIMIT 1;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Trigger to create Stripe customer on profile creation
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'create_stripe_customer_on_profile_creation'
        ) THEN
          CREATE TRIGGER create_stripe_customer_on_profile_creation
            BEFORE INSERT ON public.profiles
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_stripe_customer_creation();
        END IF;

        -- Function to handle Stripe customer deletion
        CREATE OR REPLACE FUNCTION public.handle_stripe_customer_deletion()
        RETURNS trigger
        SECURITY DEFINER
        SET search_path = public
        AS $$
        BEGIN
          IF OLD.stripe_customer_id IS NOT NULL THEN
            BEGIN
              DELETE FROM stripe.customers WHERE id = OLD.stripe_customer_id;
            EXCEPTION WHEN OTHERS THEN
              -- Log the error if needed, but continue with the deletion
              RAISE NOTICE 'Failed to delete Stripe customer: %', SQLERRM;
            END;
          END IF;
          RETURN OLD;
        END;
        $$ LANGUAGE plpgsql;

        -- Trigger to delete Stripe customer on profile deletion
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'delete_stripe_customer_on_profile_deletion'
        ) THEN
          CREATE TRIGGER delete_stripe_customer_on_profile_deletion
            BEFORE DELETE ON public.profiles
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_stripe_customer_deletion();
        END IF;
      ELSE
        RAISE NOTICE 'Stripe customers foreign table not available; skipping functions and triggers';
      END IF;
        ELSE
          RAISE NOTICE 'Stripe FDW not created; skipping server, tables, and triggers';
        END IF;
      ELSE
        RAISE NOTICE 'stripe_fdw_handler not found; skipping Stripe FDW setup';
      END IF;
    END;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping Stripe FDW setup due to: %', SQLERRM;
END
$do$;

-- Note: Authorization policies for profiles are defined elsewhere.
