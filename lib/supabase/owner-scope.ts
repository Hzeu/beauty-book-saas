import { createClient } from '@/lib/supabase/server'

/** Coluna `professional_id` nas tabelas operacionais = id do perfil = auth.users.id */
export async function getOwnerScopeId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}
