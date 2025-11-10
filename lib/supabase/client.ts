import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/environment';

export const supabase = createSupabaseClient(
  config.supabase.url,
  config.supabase.anonKey
);

export const supabaseAdmin = createSupabaseClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

// Client-side Supabase client (for use in React components)
export function createClient() {
  return createSupabaseClient(
    config.supabase.url,
    config.supabase.anonKey
  );
}

// Server-side Supabase client (for use in API routes)
export function createServerClient() {
  return createSupabaseClient(
    config.supabase.url,
    config.supabase.serviceRoleKey
  );
}
