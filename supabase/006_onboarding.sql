-- Onboarding profile: default nickname + interests (prefill check-in), comfort prefs, onboarded flag. Run after 005.
alter table profiles add column if not exists nickname text check (length(nickname) <= 24);
alter table profiles add column if not exists interests text[] not null default '{}';
alter table profiles add column if not exists comfort jsonb not null default '{}';
alter table profiles add column if not exists onboarded boolean not null default false;

create or replace function my_profile() returns jsonb language sql stable security definer set search_path = public as $$
  select to_jsonb(p) - 'user_id' from profiles p where p.user_id = auth.uid()
$$;

create or replace function save_my_profile(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  update profiles set
    nickname = coalesce(left(nullif(trim(p->>'nickname'), ''), 24), nickname),
    interests = coalesce((select array_agg(left(x, 24)) from jsonb_array_elements_text(p->'interests') x limit 3), interests),
    comfort = coalesce(p->'comfort', comfort),
    onboarded = coalesce((p->>'onboarded')::boolean, onboarded)
  where user_id = auth.uid();
end $$;
grant execute on function my_profile(), save_my_profile(jsonb) to authenticated;
