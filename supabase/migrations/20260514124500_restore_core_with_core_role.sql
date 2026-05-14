alter table public.people
add column if not exists core_role text;

alter table public.people
drop constraint if exists people_core_role_check;

alter table public.people
add constraint people_core_role_check
check (core_role is null or core_role in ('leader', 'pastor'));

update public.people
set
  core_role = case
    when level = 'pastor' then 'pastor'
    when level in ('leader', 'core') and core_role is null then 'leader'
    else core_role
  end,
  level = case
    when level in ('leader', 'pastor') then 'core'
    else level
  end
where level in ('leader', 'pastor', 'core');
