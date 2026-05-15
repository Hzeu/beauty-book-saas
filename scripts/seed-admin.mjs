/**
 * Cria usuário admin no Supabase Auth e define role no perfil.
 *
 * Uso:
 *   ADMIN_SEED_EMAIL=admin@saas.com ADMIN_SEED_PASSWORD=123456 \\
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \\
 *   node scripts/seed-admin.mjs
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_SEED_EMAIL || 'admin@saas.com'
const password = process.env.ADMIN_SEED_PASSWORD || '123456'

if (!url || !serviceKey) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Admin Master', role: 'admin' },
  })

  let userId = created?.user?.id

  if (createErr) {
    const msg = createErr.message || ''
    if (!msg.toLowerCase().includes('already') && !msg.toLowerCase().includes('registered')) {
      console.error('Erro ao criar usuário:', createErr)
      process.exit(1)
    }
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 200 })
    if (listErr) {
      console.error('Erro ao listar usuários:', listErr)
      process.exit(1)
    }
    const found = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    userId = found?.id
    if (!userId) {
      console.error('Conta já existe mas não foi encontrada na listagem. Confira o email.')
      process.exit(1)
    }
    console.log('Conta Auth já existia. Atualizando perfil…')
  } else {
    console.log('Usuário criado no Auth:', email)
  }

  const { error: upErr } = await supabase
    .from('profiles')
    .update({ role: 'admin', full_name: 'Admin Master' })
    .eq('id', userId)

  if (upErr) {
    console.error('Erro ao atualizar profiles:', upErr.message)
    process.exit(1)
  }

  console.log('Pronto. Faça login com', email, 'e acesse /admin')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
