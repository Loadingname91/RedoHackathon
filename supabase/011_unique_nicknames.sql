-- Nicknames are unique per event (ignoring case). A taken name gets the lowest free number: "Nova" -> "Nova 2" -> "Nova 3".
-- Replaces the count-based rule in 002, which could reuse a number after someone left. Run after 010. Safe to re-run.

-- Lowest free "<name> <n>" at this event; the name itself if nobody has it.
create or replace function _free_nickname(p_event uuid, p_nick text) returns text
language plpgsql stable set search_path = public as $$
declare n int := 2; c text := trim(p_nick);
begin
  while exists (select 1 from participants where event_id = p_event and lower(nickname) = lower(c)) loop
    c := left(trim(p_nick), 24 - length(' ' || n)) || ' ' || n; -- stays within the 24-character limit
    n := n + 1;
  end loop;
  return c;
end $$;
revoke all on function _free_nickname(uuid, text) from public, anon, authenticated;

-- Rename duplicates already in the table (newest check-in gets the number), then let the database enforce it.
do $$
declare r record;
begin
  for r in select id, event_id, nickname from (
      select id, event_id, nickname, row_number() over (partition by event_id, lower(nickname) order by created_at, id) rn
        from participants) d where rn > 1 order by event_id loop
    update participants set nickname = _free_nickname(r.event_id, r.nickname) where id = r.id;
  end loop;
end $$;
create unique index if not exists participants_event_nick on participants (event_id, lower(nickname));

-- check_in from 002, with the new nickname rule. Two people checking in as "Nova" at the same moment:
-- the index rejects the second insert and we retry with the next free number.
create or replace function check_in(p_event uuid, p_device uuid, p_nickname text, p_interests text[],
  p_clue text default null, p_prefers_text boolean default false, p_come_to_me boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e events; pid uuid; s uuid := gen_random_uuid(); pw text[][] := _pair_words();
  waiting participants; i int; word text; partner_nick text; tries int := 0; bad text;
begin
  select * into e from events where id = p_event;
  if e.id is null then raise exception 'no such event'; end if;
  if p_device is null then raise exception 'device id required'; end if;
  delete from participants where event_id = p_event and device_id = p_device;
  loop
    begin
      insert into participants (event_id, device_id, nickname, interests, clue, prefers_text, come_to_me, expires_at)
      values (p_event, p_device, _free_nickname(p_event, p_nickname), coalesce(p_interests,'{}'), p_clue, p_prefers_text, p_come_to_me,
              least(coalesce(e.end_at, now() + interval '3 hours'), now() + interval '6 hours'))
      returning id, nickname into pid, p_nickname;
      exit;
    exception when unique_violation then
      get stacked diagnostics bad = constraint_name;
      tries := tries + 1;
      if bad <> 'participants_event_nick' or tries >= 5 then raise; end if;
    end;
  end loop;
  insert into participant_secrets values (pid, s);

  -- someone holding a first half whose second half nobody has yet (pair i is identified by position)
  select p.* into waiting from participants p
   where p.event_id = p_event and p.id <> pid and p.half_word like '%#%'
     and split_part(p.half_word, '#', 3) = 'A'
     and not exists (select 1 from participants q where q.event_id = p_event and q.half_word like '%#%'
                     and split_part(q.half_word, '#', 1) = split_part(p.half_word, '#', 1)
                     and split_part(q.half_word, '#', 3) = 'B')
     and not exists (select 1 from blocks b where (b.blocker = p.device_id and b.blocked = p_device) or (b.blocker = p_device and b.blocked = p.device_id))
   order by _interest_score(p.interests, coalesce(p_interests,'{}')) desc, p.created_at
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
  return jsonb_build_object('participant_id', pid, 'secret', s, 'nickname', p_nickname,
    'my_word', (select split_part(half_word, '#', 2) from participants where id = pid),
    'find_word', case when waiting.id is not null then pw[i][1] else pw[i][2] end,
    'partner_waiting', waiting.id is not null);
end $$;
grant execute on function check_in(uuid,uuid,text,text[],text,boolean,boolean) to anon, authenticated;
