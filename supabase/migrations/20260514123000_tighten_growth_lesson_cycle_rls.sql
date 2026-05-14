drop policy if exists "growth_lesson_cycle_insert_authenticated"
  on public.growth_lesson_cycle;
drop policy if exists "growth_lesson_cycle_update_authenticated"
  on public.growth_lesson_cycle;

create policy "growth_lesson_cycle_insert_authenticated"
  on public.growth_lesson_cycle
  for insert
  to authenticated
  with check (
    id
    and auth.uid() is not null
    and (updated_by is null or updated_by = auth.uid())
  );

create policy "growth_lesson_cycle_update_authenticated"
  on public.growth_lesson_cycle
  for update
  to authenticated
  using (id and auth.uid() is not null)
  with check (
    id
    and auth.uid() is not null
    and (updated_by is null or updated_by = auth.uid())
  );
