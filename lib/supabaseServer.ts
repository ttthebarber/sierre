import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseServer = createClient(supabaseUrl, serviceKey)

export const createSupabaseServerClient = async () => {
  const { getToken } = await auth()
  const token = await getToken({ template: 'supabase' })
  
  // Use anon key for user-authenticated requests, service key for admin operations
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    }
  )
}