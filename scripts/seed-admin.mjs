/**
 * Creates or resets a master admin user in Supabase Auth and profiles.
 *
 * Usage:
 *   ADMIN_SEED_EMAIL=admin@beautybook.local ADMIN_SEED_PASSWORD=AdminMaster123! \
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/seed-admin.mjs
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_SEED_EMAIL || 'admin@beautybook.local'
const password = process.env.ADMIN_SEED_PASSWORD || 'AdminMaster123!'

if (!url || !serviceKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function findUserByEmail(targetEmail) {
  const normalized = targetEmail.toLowerCase()
  let page = 1

  while (page < 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error

    const found = data?.users?.find((user) => user.email?.toLowerCase() === normalized)
    if (found) return found
    if (!data?.users?.length || data.users.length < 200) return null
    page += 1
  }

  return null
}

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
      console.error('Failed to create auth user:', createErr)
      process.exit(1)
    }

    const found = await findUserByEmail(email)
    userId = found?.id
    if (!userId) {
      console.error('Auth account already exists but was not found in user list. Check the email.')
      process.exit(1)
    }

    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
      password,
      user_metadata: { full_name: 'Admin Master', role: 'admin' },
    })
    if (updateErr) {
      console.error('Failed to reset existing admin password:', updateErr)
      process.exit(1)
    }

    console.log('Existing auth account found. Password and profile will be reset.')
  } else {
    console.log('Auth user created:', email)
  }

  const { error: upErr } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email,
      role: 'admin',
      full_name: 'Admin Master',
      is_active: true,
      is_blocked: false,
    },
    { onConflict: 'id' },
  )

  if (upErr) {
    console.error('Failed to upsert profile:', upErr.message)
    process.exit(1)
  }

  console.log('Done. Login with', email, 'and open /admin')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
