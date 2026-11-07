-- Features from the final design (docs/design/screens): imported-event label, Ask the host,
-- feedback, micro-events. Run after 002. Safe to re-run; keeps data.

-- Where an event came from. 'campus_connect' = imported, no live status until a host claims it.
alter table events add column if not exists source text not null default 'host';
alter table events add column if not exists student_run boolean not null default false;
alter table events add column if not exists visibility text not null default 'campus'
  check (visibility in ('campus','constellation','connections'));
alter table events add column if not exists host_device uuid; -- micro-events only; column hidden below
revoke select on events from anon, authenticated;
grant select (id, title, host, start_at, end_at, building_code, room, offerings, access, source_text, room_goal,
  created_at, source, student_run, visibility) on events to anon, authenticated;

-- publish_event accepts "source" (seed script passes 'campus_connect').
create or replace function publish_event(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e events; s uuid := gen_random_uuid();
begin
  insert into events (title, host, start_at, end_at, building_code, room, offerings, access, source_text, source)
  values (p->>'title', p->>'host', (p->>'start_at')::timestamptz, (p->>'end_at')::timestamptz,
          coalesce(p->>'building_code','unknown'), p->>'room',
          coalesce(p->'offerings','[]'), coalesce(p->'access','{}'), left(p->>'source_text', 4000),
          case when p->>'source' = 'campus_connect' then 'campus_connect' else 'host' end)
  returning * into e;
  insert into event_secrets values (e.id, s);
  return jsonb_build_object('event_id', e.id, 'host_secret', s);
end $$;

-- A host opening the host link of an imported event claims it: live status starts.
create or replace function claim_event(p_event uuid, p_secret uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from event_secrets where event_id = p_event and secret = p_secret) then raise exception 'not the host'; end if;
  update events set source = 'host' where id = p_event;
end $$;

-- ASK THE HOST: anonymous access question; only the host reads them.
create table if not exists host_questions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events on delete cascade,
  question text not null check (length(question) between 1 and 200),
  answer text check (length(answer) <= 300),
  created_at timestamptz not null default now()
);
alter table host_questions enable row level security;
drop policy if exists read_answered on host_questions;
create policy read_answered on host_questions for select using (answer is not null); -- answered ones are public on the card

create or replace function ask_host(p_event uuid, p_question text) returns void
language plpgsql security definer set search_path = public as $$
begin
  -- shortcut: no rate limit per device; add one if spam shows up.
  if (select count(*) from host_questions where event_id = p_event and answer is null) >= 50 then raise exception 'too many open questions'; end if;
  insert into host_questions (event_id, question) values (p_event, left(trim(p_question), 200));
end $$;

create or replace function host_questions_list(p_event uuid, p_secret uuid) returns setof host_questions
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from event_secrets where event_id = p_event and secret = p_secret) then raise exception 'not the host'; end if;
  return query select * from host_questions where event_id = p_event order by created_at desc;
end $$;

create or replace function answer_question(p_event uuid, p_secret uuid, p_question uuid, p_answer text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from event_secrets where event_id = p_event and secret = p_secret) then raise exception 'not the host'; end if;
  update host_questions set answer = left(p_answer, 300) where id = p_question and event_id = p_event;
end $$;

-- FEEDBACK: one per device per event, only from devices that checked in; host sees results at 3+.
create table if not exists checkin_log (event_id uuid references events on delete cascade, device_id uuid, primary key (event_id, device_id));
create table if not exists feedback (
  event_id uuid references events on delete cascade, device_id uuid, rating int check (rating between 1 and 3),
  comment text check (length(comment) <= 500), created_at timestamptz not null default now(),
  primary key (event_id, device_id)
);
alter table checkin_log enable row level security;
alter table feedback enable row level security;

create or replace function _log_checkin() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into checkin_log values (new.event_id, new.device_id) on conflict do nothing; return new; end $$;
drop trigger if exists log_checkin on participants;
create trigger log_checkin after insert on participants for each row execute function _log_checkin();

create or replace function give_feedback(p_event uuid, p_device uuid, p_rating int, p_comment text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from checkin_log where event_id = p_event and device_id = p_device) then
    raise exception 'only people who checked in can answer'; end if;
  insert into feedback values (p_event, p_device, p_rating, left(p_comment, 500), now())
  on conflict (event_id, device_id) do update set rating = excluded.rating, comment = excluded.comment;
end $$;

create or replace function feedback_summary(p_event uuid, p_secret uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not exists (select 1 from event_secrets where event_id = p_event and secret = p_secret) then raise exception 'not the host'; end if;
  select count(*) into n from feedback where event_id = p_event;
  if n < 3 then return jsonb_build_object('responses', n, 'hidden', true); end if;
  return jsonb_build_object('responses', n, 'hidden', false,
    'ratings', (select jsonb_object_agg(rating, c) from (select rating, count(*) c from feedback where event_id = p_event group by rating) r),
    'checked_in', (select count(*) from checkin_log where event_id = p_event),
    'comments', (select jsonb_agg(comment order by created_at desc) from feedback where event_id = p_event and comment is not null));
end $$;

-- MICRO-EVENTS: need 3+ lasting bonds. Visibility: campus | constellation (people sharing a constellation) | connections (direct bonds).
create or replace function publish_micro_event(p_device uuid, p jsonb, p_visibility text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e events; s uuid := gen_random_uuid();
begin
  if (select count(*) from bonds where p_device in (device_a, device_b)) < 3 then raise exception 'hosting unlocks at 3 connections'; end if;
  if p_visibility not in ('campus','constellation','connections') then raise exception 'bad visibility'; end if;
  insert into events (title, host, start_at, end_at, building_code, room, student_run, visibility, host_device, source)
  values (left(p->>'title',120), 'Student-run', (p->>'start_at')::timestamptz, (p->>'end_at')::timestamptz,
          coalesce(p->>'building_code','unknown'), null, true, p_visibility, p_device, 'host')
  returning * into e;
  insert into event_secrets values (e.id, s);
  return jsonb_build_object('event_id', e.id, 'host_secret', s);
end $$;

-- Event ids this device may see (campus events + micro-events shared with it). The map filters by this.
create or replace function visible_event_ids(p_device uuid) returns setof uuid
language sql security definer set search_path = public as $$
  select id from events where not student_run or visibility = 'campus' or host_device = p_device
  union
  select e.id from events e join bonds b on e.host_device in (b.device_a, b.device_b) and p_device in (b.device_a, b.device_b)
   where e.student_run and e.visibility = 'connections'
  union
  select e.id from events e join constellations c on e.host_device = any(c.devices) and p_device = any(c.devices)
   where e.student_run and e.visibility = 'constellation'
$$;

grant execute on function claim_event(uuid,uuid), ask_host(uuid,text), host_questions_list(uuid,uuid),
  answer_question(uuid,uuid,uuid,text), give_feedback(uuid,uuid,int,text), feedback_summary(uuid,uuid),
  publish_micro_event(uuid,jsonb,text), visible_event_ids(uuid) to anon, authenticated;

-- The 8 seeded events came from the Campus Connect feed.
update events set source = 'campus_connect' where source_text is not null and source = 'host' and created_at < now() - interval '1 minute'
  and id not in (select event_id from host_questions);
