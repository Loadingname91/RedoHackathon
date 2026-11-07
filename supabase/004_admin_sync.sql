-- Admin sync of the Campus Connect iCal feed + run history. Run after 003. Safe to re-run; keeps data.

alter table events add column if not exists source_uid text;
alter table events add column if not exists source_url text;
create unique index if not exists events_source_uid on events (source_uid) where source_uid is not null;
grant select (source_url) on events to anon, authenticated;

create table if not exists admin_secrets (secret uuid primary key);
alter table admin_secrets enable row level security; -- no policies: never readable by browsers
insert into admin_secrets select gen_random_uuid() where not exists (select 1 from admin_secrets);

create table if not exists sync_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running','ok','failed')),
  fetched int not null default 0, new_count int not null default 0, updated_count int not null default 0,
  skipped_count int not null default 0, error text, skipped jsonb not null default '[]', feed_status int
);
alter table sync_runs enable row level security; -- read only through sync_runs_list

create or replace function _is_admin(p_admin uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_admin is null or not exists (select 1 from admin_secrets where secret = p_admin) then raise exception 'not an admin'; end if;
end $$;
revoke all on function _is_admin(uuid) from public, anon, authenticated;

create or replace function sync_start(p_admin uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  perform _is_admin(p_admin);
  -- a run left "running" for 10+ minutes crashed; let a new one start
  update sync_runs set status = 'failed', finished_at = now(), error = 'timed out'
   where status = 'running' and started_at < now() - interval '10 minutes';
  if exists (select 1 from sync_runs where status = 'running') then raise exception 'a sync is already running'; end if;
  insert into sync_runs default values returning id into rid;
  return rid;
end $$;

-- Insert or update one feed event. Returns 'new' | 'updated' | 'unchanged'.
-- p: {uid, title, host, start_at, end_at, building_code (null = keep), room, offerings, source_text, source_url}
create or replace function sync_upsert_event(p_admin uuid, p_run uuid, p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare e events; st timestamptz := (p->>'start_at')::timestamptz;
begin
  perform _is_admin(p_admin);
  if coalesce(p->>'uid','') = '' or coalesce(p->>'title','') = '' or st is null then raise exception 'uid, title and start_at are required'; end if;
  select * into e from events where source_uid = p->>'uid';
  if e.id is null then
    -- backfill: an earlier seeded copy (same building, same start) without a uid
    select * into e from events where source_uid is null and not student_run
       and building_code = coalesce(p->>'building_code', building_code) and abs(extract(epoch from start_at - st)) < 60
     limit 1;
    if e.id is not null then update events set source_uid = p->>'uid' where id = e.id; end if;
  end if;

  if e.id is null then
    if coalesce(p->>'building_code','unknown') = 'unknown' then raise exception 'building required for a new event'; end if;
    insert into events (title, host, start_at, end_at, building_code, room, offerings, source_text, source, source_uid, source_url)
    values (left(p->>'title',120), p->>'host', st, (p->>'end_at')::timestamptz, p->>'building_code', p->>'room',
            coalesce(p->'offerings','[]'), left(p->>'source_text',4000), 'campus_connect', p->>'uid', p->>'source_url')
    returning * into e;
    insert into event_secrets values (e.id, gen_random_uuid());
    return 'new';
  end if;

  if e.title = left(p->>'title',120) and e.start_at = st and e.end_at is not distinct from (p->>'end_at')::timestamptz
     and e.room is not distinct from p->>'room' and e.building_code = coalesce(p->>'building_code', e.building_code)
     and (e.source = 'host' or e.offerings = coalesce(p->'offerings','[]')) then
    return 'unchanged';
  end if;
  update events set title = left(p->>'title',120), start_at = st, end_at = (p->>'end_at')::timestamptz,
    room = p->>'room', building_code = coalesce(p->>'building_code', building_code),
    source_text = left(p->>'source_text',4000), source_url = p->>'source_url',
    offerings = case when source = 'host' then offerings else coalesce(p->'offerings','[]') end -- claimed: host owns live status
  where id = e.id;
  return 'updated';
end $$;

create or replace function sync_finish(p_admin uuid, p_run uuid, p_counts jsonb, p_skipped jsonb, p_error text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform _is_admin(p_admin);
  update sync_runs set finished_at = now(), status = case when p_error is null then 'ok' else 'failed' end,
    fetched = coalesce((p_counts->>'fetched')::int, 0), new_count = coalesce((p_counts->>'new')::int, 0),
    updated_count = coalesce((p_counts->>'updated')::int, 0), skipped_count = coalesce((p_counts->>'skipped')::int, 0),
    feed_status = (p_counts->>'feed_status')::int, skipped = coalesce(p_skipped, '[]'), error = left(p_error, 500)
  where id = p_run;
end $$;

create or replace function sync_runs_list(p_admin uuid) returns setof sync_runs
language plpgsql security definer set search_path = public as $$
begin
  perform _is_admin(p_admin);
  return query select * from sync_runs order by started_at desc limit 20;
end $$;

grant execute on function sync_start(uuid), sync_upsert_event(uuid,uuid,jsonb), sync_finish(uuid,uuid,jsonb,jsonb,text),
  sync_runs_list(uuid) to anon, authenticated;
