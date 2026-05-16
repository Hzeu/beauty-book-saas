-- Ensure authenticated professionals can manage their own services.
-- professional_id stores public.profiles.id, which is the same UUID as auth.users.id.

do $$
begin
  if to_regclass('public.service_categories') is not null then
    execute 'alter table public.service_categories enable row level security';

    execute 'drop policy if exists "service_categories_select_own" on public.service_categories';
    execute 'create policy "service_categories_select_own"
      on public.service_categories for select
      using (service_categories.professional_id = auth.uid())';

    execute 'drop policy if exists "service_categories_insert_own" on public.service_categories';
    execute 'create policy "service_categories_insert_own"
      on public.service_categories for insert
      with check (service_categories.professional_id = auth.uid())';

    execute 'drop policy if exists "service_categories_update_own" on public.service_categories';
    execute 'create policy "service_categories_update_own"
      on public.service_categories for update
      using (service_categories.professional_id = auth.uid())
      with check (service_categories.professional_id = auth.uid())';

    execute 'drop policy if exists "service_categories_delete_own" on public.service_categories';
    execute 'create policy "service_categories_delete_own"
      on public.service_categories for delete
      using (service_categories.professional_id = auth.uid())';
  end if;

  if to_regclass('public.services') is not null then
    execute 'alter table public.services enable row level security';

    execute 'drop policy if exists "services_select_own" on public.services';
    execute 'create policy "services_select_own"
      on public.services for select
      using (services.professional_id = auth.uid())';

    execute 'drop policy if exists "services_insert_own" on public.services';
    execute 'create policy "services_insert_own"
      on public.services for insert
      with check (
        services.professional_id = auth.uid()
        and (
          services.category_id is null
          or exists (
            select 1
            from public.service_categories sc
            where sc.id = services.category_id
              and sc.professional_id = auth.uid()
          )
        )
      )';

    execute 'drop policy if exists "services_update_own" on public.services';
    execute 'create policy "services_update_own"
      on public.services for update
      using (services.professional_id = auth.uid())
      with check (
        services.professional_id = auth.uid()
        and (
          services.category_id is null
          or exists (
            select 1
            from public.service_categories sc
            where sc.id = services.category_id
              and sc.professional_id = auth.uid()
          )
        )
      )';

    execute 'drop policy if exists "services_delete_own" on public.services';
    execute 'create policy "services_delete_own"
      on public.services for delete
      using (services.professional_id = auth.uid())';
  end if;
end $$;
