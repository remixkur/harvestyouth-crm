create table if not exists public.growth_lesson_cycle (
  id boolean primary key default true,
  last_lesson_number smallint not null default 1,
  updated_at timestamp with time zone not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint growth_lesson_cycle_singleton check (id),
  constraint growth_lesson_cycle_last_lesson_number_check check (
    last_lesson_number between 1 and 4
  )
);

alter table public.growth_lesson_cycle enable row level security;

grant select, insert, update on table public.growth_lesson_cycle to authenticated;

drop policy if exists "growth_lesson_cycle_select_authenticated"
  on public.growth_lesson_cycle;
drop policy if exists "growth_lesson_cycle_insert_authenticated"
  on public.growth_lesson_cycle;
drop policy if exists "growth_lesson_cycle_update_authenticated"
  on public.growth_lesson_cycle;

create policy "growth_lesson_cycle_select_authenticated"
  on public.growth_lesson_cycle
  for select
  to authenticated
  using (true);

create policy "growth_lesson_cycle_insert_authenticated"
  on public.growth_lesson_cycle
  for insert
  to authenticated
  with check (true);

create policy "growth_lesson_cycle_update_authenticated"
  on public.growth_lesson_cycle
  for update
  to authenticated
  using (true)
  with check (true);

insert into public.growth_lesson_cycle (id, last_lesson_number)
values (true, 1)
on conflict (id) do nothing;

update public.people
set level = 'leader'
where level = 'core';
