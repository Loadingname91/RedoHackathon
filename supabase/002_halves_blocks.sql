-- Adds "find your half" pairing and block/report. Run after schema.sql. Safe to re-run; keeps existing data.

create table if not exists blocks (
  blocker uuid not null, blocked uuid not null, created_at timestamptz not null default now(),
  primary key (blocker, blocked)
);
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete set null,
  reporter uuid not null, reported uuid not null, reason text check (length(reason) <= 500),
  created_at timestamptz not null default now()
);
alter table blocks enable row level security;   -- no policies: browsers can't read either table
alter table reports enable row level security;

create or replace function _pair_words() returns text[][] language sql immutable as $$
  select array[['FRY','SAUCE'],['DELICATE','ARCH'],['PIZZA','PINEAPPLE'],['RED','ROCKS'],['SALT','LAKE'],
               ['POWDER','DAY'],['RED','BUTTE'],['BLOCK','U'],['CANYON','ROAD'],['GREEN','JELLO'],
               ['MOAB','ARCHES'],['SKI','LIFT'],['TRAX','TRAIN'],['CRIMSON','NIGHT'],['ZION','ANGELS']]
$$;

-- check_in now also hands out half-words: matches you to someone waiting for their other half,
-- preferring a shared interest; otherwise you start a new pair and wait.
create or replace function check_in(p_event uuid, p_device uuid, p_nickname text, p_interests text[],
  p_clue text default null, p_prefers_text boolean default false, p_come_to_me boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e events; pid uuid; s uuid := gen_random_uuid(); pw text[][] := _pair_words();
  waiting participants; i int; word text; partner_nick text;
begin
  select * into e from events where id = p_event;
  if e.id is null then raise exception 'no such event'; end if;
  if p_device is null then raise exception 'device id required'; end if;
  delete from participants where event_id = p_event and device_id = p_device;
  insert into participants (event_id, device_id, nickname, interests, clue, prefers_text, come_to_me, expires_at)
  values (p_event, p_device, p_nickname, coalesce(p_interests,'{}'), p_clue, p_prefers_text, p_come_to_me,
          least(coalesce(e.end_at, now() + interval '3 hours'), now() + interval '6 hours'))
  returning id into pid;
  insert into participant_secrets values (pid, s);

  -- someone holding a first half whose second half nobody has yet (pair i is identified by position)
  select p.* into waiting from participants p
   where p.event_id = p_event and p.id <> pid and p.half_word like '%#%'
     and split_part(p.half_word, '#', 3) = 'A'
     and not exists (select 1 from participants q where q.event_id = p_event and q.half_word like '%#%'
                     and split_part(q.half_word, '#', 1) = split_part(p.half_word, '#', 1)
                     and split_part(q.half_word, '#', 3) = 'B')
     and not exists (select 1 from blocks b where (b.blocker = p.device_id and b.blocked = p_device) or (b.blocker = p_device and b.blocked = p.device_id))
   order by (p.interests && coalesce(p_interests,'{}')) desc, p.created_at
   limit 1;
  if waiting.id is not null then
    i := split_part(waiting.half_word, '#', 1)::int;
    update participants set half_word = i || '#' || pw[i][2] || '#B' where id = pid;
    partner_nick := waiting.nickname;
  else
    -- next pair number not yet started at this event (wraps around after 15 pairs)
    select coalesce(max(split_part(half_word, '#', 1)::int), 0) % array_length(pw, 1) + 1 into i
      from participants where event_id = p_event and half_word like '%#%' and id <> pid;
    update participants set half_word = i || '#' || pw[i][1] || '#A' where id = pid;
  end if;
  return jsonb_build_object('participant_id', pid, 'secret', s,
    'my_word', (select split_part(half_word, '#', 2) from participants where id = pid),
    'find_word', case when waiting.id is not null then pw[i][1] else pw[i][2] end,
    'partner_waiting', waiting.id is not null);
end $$;
-- half_word is stored as "<pair#>#<WORD>#<A|B>"; the app shows split_part(…, '#', 2).

-- Block: removes any line between you, stops future connections and pairing. Silent to the other person.
create or replace function block_person(p_id uuid, p_secret uuid, p_other uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me participants; other_dev uuid;
begin
  me := _who(p_id, p_secret);
  select device_id into other_dev from participants where id = p_other;
  if other_dev is null then raise exception 'person not found'; end if;
  insert into blocks values (me.device_id, other_dev) on conflict do nothing;
  delete from connections where (a = me.id and b = p_other) or (b = me.id and a = p_other);
end $$;

create or replace function report_person(p_id uuid, p_secret uuid, p_other uuid, p_reason text) returns void
language plpgsql security definer set search_path = public as $$
declare me participants; other_dev uuid;
begin
  me := _who(p_id, p_secret);
  select device_id into other_dev from participants where id = p_other;
  if other_dev is null then raise exception 'person not found'; end if;
  insert into reports (event_id, reporter, reported, reason) values (me.event_id, me.device_id, other_dev, left(p_reason, 500));
  insert into blocks values (me.device_id, other_dev) on conflict do nothing; -- reporting also blocks
  delete from connections where (a = me.id and b = p_other) or (b = me.id and a = p_other);
end $$;

-- redeem_code: also refuses blocked pairs (same message, so the blocked person learns nothing).
create or replace function redeem_code(p_id uuid, p_secret uuid, p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare me participants; owner uuid; cid uuid;
begin
  me := _who(p_id, p_secret);
  select cc.participant_id into owner from connect_codes cc join participants p on p.id = cc.participant_id
   where cc.code = p_code and cc.expires_at > now() and p.event_id = me.event_id and p.id <> me.id
     and not exists (select 1 from blocks b where (b.blocker = p.device_id and b.blocked = me.device_id)
                                             or (b.blocker = me.device_id and b.blocked = p.device_id))
   limit 1;
  if owner is null then raise exception 'code expired or not at this event'; end if;
  delete from connect_codes where participant_id = owner;
  insert into connections (event_id, a, b, prompt) values (me.event_id, owner, me.id,
    'Find something you both like that has nothing to do with your major.')
  on conflict do nothing returning id into cid;
  if cid is null then raise exception 'already connected'; end if;
  return cid;
end $$;

grant execute on function check_in(uuid,uuid,text,text[],text,boolean,boolean), block_person(uuid,uuid,uuid),
  report_person(uuid,uuid,uuid,text) to anon, authenticated;
