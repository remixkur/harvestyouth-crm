update public.people
set
  core_role = case
    when level = 'pastor' then 'pastor'
    when level = 'leader' then 'leader'
    when level = 'core' and core_role in ('leader', 'pastor') then core_role
    when level = 'core' then 'leader'
    else null
  end,
  level = case
    when level in ('leader', 'pastor') then 'core'
    else level
  end;

alter table public.people
alter column level set default 'local';

alter table public.people
drop constraint if exists people_level_check;

alter table public.people
add constraint people_level_check
check (level in ('passerby', 'local', 'visiting', 'church', 'committed', 'core'));

alter table public.people
drop constraint if exists people_core_role_check;

alter table public.people
add constraint people_core_role_check
check (
  (
    level = 'core'
    and core_role in ('leader', 'pastor')
  )
  or (
    level <> 'core'
    and core_role is null
  )
);

comment on column public.people.core_role is
'Role marker for core people: leader or pastor. Null for non-core levels.';
