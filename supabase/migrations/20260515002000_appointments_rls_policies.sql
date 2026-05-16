-- Ensure professionals can manage only their own manual appointments.

do $$
begin
  if to_regclass('public.appointments') is not null then
    execute 'alter table public.appointments enable row level security';

    execute 'drop policy if exists "appointments_select_own" on public.appointments';
    execute 'create policy "appointments_select_own"
      on public.appointments for select to authenticated
      using (appointments.professional_id = auth.uid())';

    execute 'drop policy if exists "appointments_insert_own" on public.appointments';
    execute 'create policy "appointments_insert_own"
      on public.appointments for insert to authenticated
      with check (
        appointments.professional_id = auth.uid()
        and exists (
          select 1
          from public.clients c
          where c.id = appointments.client_id
            and c.professional_id = auth.uid()
        )
        and exists (
          select 1
          from public.services s
          where s.id = appointments.service_id
            and s.professional_id = auth.uid()
        )
      )';

    execute 'drop policy if exists "appointments_update_own" on public.appointments';
    execute 'create policy "appointments_update_own"
      on public.appointments for update to authenticated
      using (appointments.professional_id = auth.uid())
      with check (
        appointments.professional_id = auth.uid()
        and exists (
          select 1
          from public.clients c
          where c.id = appointments.client_id
            and c.professional_id = auth.uid()
        )
        and exists (
          select 1
          from public.services s
          where s.id = appointments.service_id
            and s.professional_id = auth.uid()
        )
      )';

    execute 'drop policy if exists "appointments_delete_own" on public.appointments';
    execute 'create policy "appointments_delete_own"
      on public.appointments for delete to authenticated
      using (appointments.professional_id = auth.uid())';
  end if;
end $$;
