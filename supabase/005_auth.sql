-- Google sign-in (Supabase Auth) + roles. Run after 004. Safe to re-run; keeps data.
-- Everyone who signs in is a student. Organizer/admin roles are granted by an admin (set_role).

create table if not exists profiles (
  user_id uuid primary key references auth.users on delete cascade,
  email text,
  role text not null default 'student' check (role in ('student','organizer','admin')),
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;
drop policy if exists own_profile on profiles;
create policy own_profile on profiles for select using (auth.uid() = user_id);

create or replace function _new_profile() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into profiles (user_id, email) values (new.id, new.email) on conflict do nothing; return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function _new_profile();
insert into profiles (user_id, email) select id, email from auth.users on conflict do nothing; -- users who signed in before this ran

-- Which signed-in organizer runs which event. Host secrets stay the mechanism; this just hands them to the owner on login.
create table if not exists event_hosts (
  event_id uuid references events on delete cascade, user_id uuid references auth.users on delete cascade,
  primary key (event_id, user_id)
);
alter table event_hosts enable row level security; -- no policies: read only via my_hosted_events()

create or replace function my_role() returns text language sql stable security definer set search_path = public as $$
  select coalesce((select role from profiles where user_id = auth.uid()), 'student')
$$;

create or replace function my_hosted_events() returns table (event_id uuid, host_secret uuid)
language sql stable security definer set search_path = public as $$
  select h.event_id, s.secret from event_hosts h join event_secrets s on s.event_id = h.event_id
   where h.user_id = auth.uid() and (select role from profiles where user_id = auth.uid()) in ('organizer','admin')
$$;

-- A signed-in organizer who opens a host link (or publishes) attaches that event to their account.
create or replace function link_host_event(p_event uuid, p_secret uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if not exists (select 1 from event_secrets where event_id = p_event and secret = p_secret) then raise exception 'not the host'; end if;
  insert into event_hosts values (p_event, auth.uid()) on conflict do nothing;
end $$;

-- Admin grants roles by email (admin key, same as the sync screen).
create or replace function set_role(p_admin uuid, p_email text, p_role text) returns text
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not exists (select 1 from admin_secrets where secret = p_admin) then raise exception 'not an admin'; end if;
  if p_role not in ('student','organizer','admin') then raise exception 'bad role'; end if;
  update profiles set role = p_role where lower(email) = lower(trim(p_email));
  get diagnostics n = row_count;
  if n = 0 then raise exception 'no account with that email yet: they need to sign in once first'; end if;
  return p_role;
end $$;

grant execute on function my_role(), my_hosted_events(), link_host_event(uuid,uuid) to authenticated;
grant execute on function my_role() to anon;
grant execute on function set_role(uuid,text,text) to anon, authenticated;
