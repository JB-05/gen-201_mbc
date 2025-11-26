import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Server-side Supabase client using service role key. This bypasses RLS and is ONLY for trusted server code.
// Ensure SUPABASE_SERVICE_ROLE_KEY is set in server environment variables (never expose to client).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    }
);






