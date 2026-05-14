create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

drop policy if exists "home_group_photos_public_read" on storage.objects;
drop policy if exists "home_group_photos_authenticated_upload" on storage.objects;
drop policy if exists "home_group_photos_authenticated_update" on storage.objects;
drop policy if exists "home_group_photos_authenticated_delete" on storage.objects;

create policy "home_group_photos_authenticated_upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'home-group-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
