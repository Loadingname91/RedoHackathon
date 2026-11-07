-- Constellation U schema. Safe to re-run (drops and recreates).
-- Security model: no logins. Each device gets a random secret at check-in or when publishing.
-- Browsers can only READ tables; every write goes through a function below that checks the secret.
-- shortcut: device secrets instead of real accounts; switch to Supabase Auth (U email) after the hackathon.

drop function if exists check_in(uuid,text,text[],text,boolean,boolean);
drop table if exists bonds, constellations, connections, connect_codes, participant_secrets, participants, event_secrets, events cascade;

-- EVENTS ---------------------------------------------------------------
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 120),
  host text,
  start_at timestamptz,
  end_at timestamptz,
  building_code text not null,          -- from buildings.json, or 'unknown'
  room text,
  offerings jsonb not null default '[]', -- [{"type":"food","text":"pizza","status":"available"}]
  access jsonb not null default '{}',    -- {"step_free":"unknown",...}
  source_text text,
  room_goal int not null default 20,
  created_at timestamptz not null default now()
);
create table event_secrets (event_id uuid primary key references events on delete cascade, secret uuid not null);

-- PEOPLE AT AN EVENT (temporary) -----------------------------------------
create table participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events on delete cascade,
  device_id uuid not null,               -- stable per phone (H2). Never readable by browsers.
  nickname text not null check (length(nickname) between 1 and 24),
  interests text[] not null default '{}',
  clue text check (length(clue) <= 80),
  prefers_text boolean not null default false,
  come_to_me boolean not null default false,
  half_word text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create table participant_secrets (participant_id uuid primary key references participants on delete cascade, secret uuid not null);

-- Rotating connect codes (30 s)
create table connect_codes (
  participant_id uuid primary key references participants on delete cascade,
  code text not null,
  expires_at timestamptz not null
);

-- CONNECTIONS: a = code owner, b = scanner. Line shows only when both confirmed.
create table connections (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events on delete cascade,
  a uuid not null references participants on delete cascade,
  b uuid not null references participants on delete cascade,
  prompt text,
  answer text check (length(answer) <= 200),
  a_confirmed boolean not null default false,
  b_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  check (a <> b)
);
create unique index connections_pair on connections (least(a,b), greatest(a,b));

create table constellations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events on delete cascade,
  name text not null check (length(name) between 1 and 40),
  members uuid[] not null,
  devices uuid[] not null default '{}',  -- for My sky; not readable by browsers
  created_at timestamptz not null default now()
);

-- Lasting record of a confirmed connection, kept after the event ends (H3). Private.
create table bonds (
  device_a uuid not null, device_b uuid not null, event_id uuid, created_at timestamptz not null default now(),
  primary key (device_a, device_b), check (device_a < device_b)
);

-- ROW-LEVEL SECURITY: read-only for browsers; secrets and codes are never readable.
alter table events enable row level security;
alter table event_secrets enable row level security;
alter table participants enable row level security;
alter table participant_secrets enable row level security;
alter table connect_codes enable row level security;
alter table connections enable row level security;
alter table constellations enable row level security;
alter table bonds enable row level security;

create policy read_events on events for select using (true);
-- shortcut: any browser can read nicknames at any live event; hide per-event later with real auth.
create policy read_participants on participants for select using (expires_at > now());
create policy read_connections on connections for select using (true);
create policy read_constellations on constellations for select using (true);
revoke select on participants, constellations from anon, authenticated;
grant select (id, event_id, nickname, interests, prefers_text, come_to_me, half_word, created_at, expires_at) on participants to anon, authenticated;
grant select (id, event_id, name, members, created_at) on constellations to anon, authenticated;
-- No policies on event_secrets / participant_secrets / connect_codes = no browser access at all.

-- HELPERS ------------------------------------------------------------------
create or replace function _who(p_id uuid, p_secret uuid) returns participants
language plpgsql security definer set search_path = public as $$
declare r participants;
begin
  select p.* into r from participants p join participant_secrets s on s.participant_id = p.id
   where p.id = p_id and s.secret = p_secret and p.expires_at > now();
  if r.id is null then raise exception 'not checked in'; end if;
  return r;
end $$;
revoke all on function _who(uuid, uuid) from public, anon, authenticated;

-- ORGANIZER ----------------------------------------------------------------
create or replace function publish_event(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e events; s uuid := gen_random_uuid();
begin
  insert into events (title, host, start_at, end_at, building_code, room, offerings, access, source_text)
  values (p->>'title', p->>'host', (p->>'start_at')::timestamptz, (p->>'end_at')::timestamptz,
          coalesce(p->>'building_code','unknown'), p->>'room',
          coalesce(p->'offerings','[]'), coalesce(p->'access','{}'), left(p->>'source_text', 4000))
  returning * into e;
  insert into event_secrets values (e.id, s);
  return jsonb_build_object('event_id', e.id, 'host_secret', s);
end $$;

create or replace function set_offerings(p_event uuid, p_secret uuid, p_offerings jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from event_secrets where event_id = p_event and secret = p_secret) then
    raise exception 'not the host'; end if;
  update events set offerings = p_offerings where id = p_event;
end $$;

-- STUDENT ------------------------------------------------------------------
create or replace function check_in(p_event uuid, p_device uuid, p_nickname text, p_interests text[],
  p_clue text default null, p_prefers_text boolean default false, p_come_to_me boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e events; pid uuid; s uuid := gen_random_uuid();
begin
  select * into e from events where id = p_event;
  if e.id is null then raise exception 'no such event'; end if;
  if p_device is null then raise exception 'device id required'; end if;
  delete from participants where event_id = p_event and device_id = p_device; -- re-check-in replaces
  insert into participants (event_id, device_id, nickname, interests, clue, prefers_text, come_to_me, expires_at)
  values (p_event, p_device, p_nickname, coalesce(p_interests,'{}'), p_clue, p_prefers_text, p_come_to_me,
          least(coalesce(e.end_at, now() + interval '3 hours'), now() + interval '6 hours'))
  returning id into pid;
  insert into participant_secrets values (pid, s);
  return jsonb_build_object('participant_id', pid, 'secret', s);
end $$;

create or replace function leave_event(p_id uuid, p_secret uuid) returns void
language plpgsql security definer set search_path = public as $$
begin perform _who(p_id, p_secret); delete from participants where id = p_id; end $$;

create or replace function new_connect_code(p_id uuid, p_secret uuid) returns text
language plpgsql security definer set search_path = public as $$
declare c text := lpad((floor(random()*10000))::int::text, 4, '0');
begin
  perform _who(p_id, p_secret);
  insert into connect_codes values (p_id, c, now() + interval '30 seconds')
  on conflict (participant_id) do update set code = excluded.code, expires_at = excluded.expires_at;
  return c;
end $$;

-- Scanner redeems someone's code. Proves both are at the same event right now.
create or replace function redeem_code(p_id uuid, p_secret uuid, p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare me participants; owner uuid; cid uuid;
begin
  me := _who(p_id, p_secret);
  select cc.participant_id into owner from connect_codes cc join participants p on p.id = cc.participant_id
   where cc.code = p_code and cc.expires_at > now() and p.event_id = me.event_id and p.id <> me.id
   limit 1;
  if owner is null then raise exception 'code expired or not at this event'; end if;
  delete from connect_codes where participant_id = owner; -- one use
  insert into connections (event_id, a, b, prompt) values (me.event_id, owner, me.id,
    'Find something you both like that has nothing to do with your major.')
  on conflict do nothing returning id into cid;
  if cid is null then raise exception 'already connected'; end if;
  return cid;
end $$;

-- Each side confirms for themselves only. Either side may set the shared answer before both confirm.
create or replace function confirm_connection(p_id uuid, p_secret uuid, p_conn uuid, p_answer text default null)
returns void language plpgsql security definer set search_path = public as $$
declare me participants; c connections;
begin
  me := _who(p_id, p_secret);
  select * into c from connections where id = p_conn;
  if c.id is null or me.id not in (c.a, c.b) then raise exception 'not your connection'; end if;
  update connections set
    answer = coalesce(nullif(p_answer,''), answer),
    a_confirmed = a_confirmed or me.id = c.a,
    b_confirmed = b_confirmed or me.id = c.b
  where id = p_conn returning * into c;
  if c.a_confirmed and c.b_confirmed then
    insert into bonds (device_a, device_b, event_id)
    select least(pa.device_id, pb.device_id), greatest(pa.device_id, pb.device_id), c.event_id
      from participants pa, participants pb where pa.id = c.a and pb.id = c.b and pa.device_id <> pb.device_id
    on conflict do nothing;
  end if;
end $$;

create or replace function remove_connection(p_id uuid, p_secret uuid, p_conn uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me participants;
begin
  me := _who(p_id, p_secret);
  delete from connections where id = p_conn and me.id in (a, b);
end $$;

-- Name a constellation: caller must be a member and every member must be confirmed-connected at this event.
create or replace function name_constellation(p_id uuid, p_secret uuid, p_members uuid[], p_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare me participants; cid uuid; n int;
begin
  me := _who(p_id, p_secret);
  if not me.id = any(p_members) or cardinality(p_members) < 3 then raise exception 'need 3+ members including you'; end if;
  -- shortcut: checks each member has a confirmed link to another member, not full graph connectivity.
  select count(*) into n from unnest(p_members) m where exists (
    select 1 from connections c where c.event_id = me.event_id and c.a_confirmed and c.b_confirmed
      and ((c.a = m and c.b = any(p_members)) or (c.b = m and c.a = any(p_members))));
  if n <> cardinality(p_members) then raise exception 'not all members are connected'; end if;
  insert into constellations (event_id, name, members, devices)
  values (me.event_id, p_name, p_members, (select array_agg(device_id) from participants where id = any(p_members)))
  returning id into cid;
  return cid;
end $$;

-- My sky (profile). shortcut: the device id is the only key; real logins replace this later.
create or replace function my_sky(p_device uuid) returns jsonb
language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'stars', (select count(*) from bonds where p_device in (device_a, device_b)),
    'hosting_unlocked', (select count(*) from bonds where p_device in (device_a, device_b)) >= 3,
    'constellations', coalesce((select jsonb_agg(jsonb_build_object('name', c.name, 'event', e.title, 'size', cardinality(c.members), 'at', c.created_at) order by c.created_at desc)
       from constellations c join events e on e.id = c.event_id where p_device = any(c.devices)), '[]'))
$$;

-- The other person's clue, only once you share a connection.
create or replace function match_clue(p_id uuid, p_secret uuid, p_other uuid) returns text
language plpgsql security definer set search_path = public as $$
declare me participants; cl text;
begin
  me := _who(p_id, p_secret);
  select p.clue into cl from participants p join connections c on (c.a = me.id and c.b = p.id) or (c.b = me.id and c.a = p.id)
   where p.id = p_other;
  return cl;
end $$;

grant execute on function my_sky(uuid), match_clue(uuid,uuid,uuid) to anon, authenticated;
grant execute on function publish_event(jsonb), set_offerings(uuid,uuid,jsonb),
  check_in(uuid,uuid,text,text[],text,boolean,boolean), leave_event(uuid,uuid), new_connect_code(uuid,uuid),
  redeem_code(uuid,uuid,text), confirm_connection(uuid,uuid,uuid,text), remove_connection(uuid,uuid,uuid),
  name_constellation(uuid,uuid,uuid[],text) to anon, authenticated;

-- LIVE UPDATES for the map and the event screen
alter publication supabase_realtime add table events, participants, connections, constellations;
