import type { SupabaseClient } from '@supabase/supabase-js'

const ASSETS_BUCKET = 'assets'
const DEFAULT_EXPIRES_SECONDS = 600

export async function getSignedReadUrl(
  supabase: SupabaseClient,
  path: string,
  expiresIn: number = DEFAULT_EXPIRES_SECONDS
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? 'Failed to sign storage URL')
  }

  return data.signedUrl
}
