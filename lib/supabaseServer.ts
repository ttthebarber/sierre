import { createClient } from '@supabase/supabase-js'

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const createSupabaseServerClient = async () => {
  // For API routes, use service role client for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Debug logging
  console.log('Environment check:');
  console.log('SUPABASE_URL exists:', !!supabaseUrl);
  console.log('SUPABASE_KEY exists:', !!supabaseKey);
  console.log('SUPABASE_URL length:', supabaseUrl?.length || 0);
  console.log('SUPABASE_KEY length:', supabaseKey?.length || 0);
  
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  
  if (!supabaseKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}