import { supabaseServer } from '@/lib/supabaseServer'

export async function saveShopToken(shop: string, accessToken: string, scopes: string) {
  await supabaseServer
    .from('shopify_stores')
    .upsert({ shop, access_token: accessToken, scopes })
    .throwOnError()
}

export async function getShopToken(shop: string) {
  const { data, error } = await supabaseServer
    .from('shopify_stores')
    .select('access_token, scopes')
    .eq('shop', shop)
    .maybeSingle()
  if (error) throw error
  return data as { access_token: string; scopes: string } | null
}

export async function logWebhook(shop: string, topic: string, payload: any) {
  await supabaseServer
    .from('shopify_webhook_logs')
    .insert({ shop, topic, payload })
    .throwOnError()
}


