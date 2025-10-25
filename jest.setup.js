const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(process.cwd(), ".env.test.local") });

// Ensure tests see the same Supabase values regardless of naming convention.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.SUPABASE_URL;
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  if (serviceKey) {
    process.env.SUPABASE_SERVICE_KEY = serviceKey;
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = serviceKey;
    }
  }
}
