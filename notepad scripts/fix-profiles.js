import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      alter table profiles add column if not exists role text default 'client';
      alter table profiles add column if not exists is_active boolean default true;
      alter table profiles add column if not exists is_blocked boolean default false;
    `
  })

  console.log(error || 'OK')
}

run()