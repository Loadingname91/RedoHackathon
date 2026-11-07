-- Check-in state lives on the server: hide/show without leaving, list my check-ins, resume on another device.
-- Run after 007. Safe to re-run; keeps data.

alter table participants add column if not exists hidden boolean not null default false;
-- Hidden people are invisible to everyone else (they stay checked in and keep their lines).
drop policy if exists read_participants on participants;
create policy read_participants on participants for select using (expires_at > now() and not hidden);

create or replace function set_hidden(p_id uuid, p_secret uuid, p_hidden boolean) returns void
language plpgsql security definer set search_path = public as $$
begin perform _who(p_id, p_secret); update participants set hidden = p_hidden where id = p_id; end $$;

-- Where am I checked in right now? (the truth the app syncs to)
create or replace function my_checkins(p_device uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare me uuid := _me(p_device);
begin
  return coalesce((select jsonb_agg(jsonb_build_object('event_id', p.event_id, 'participant_id', p.id, 'title', e.title,
      'building_code', e.building_code, 'hidden', p.hidden, 'nickname', p.nickname, 'expires_at', p.expires_at))
    from participants p join events e on e.id = p.event_id
    where p.device_id = me and p.expires_at > now()), '[]');
end $$;

-- Pick up an existing check-in on this phone (same account or same device id): returns the session the app needs.
create or replace function resume_checkin(p_device uuid, p_event uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := _me(p_device); p participants; s uuid; pw text[][] := _pair_words(); i int;
begin
  select * into p from participants where device_id = me and event_id = p_event and expires_at > now();
  if p.id is null then raise exception 'not checked in'; end if;
  select secret into s from participant_secrets where participant_id = p.id;
  i := nullif(split_part(coalesce(p.half_word, ''), '#', 1), '')::int;
  return jsonb_build_object('participant_id', p.id, 'secret', s, 'nickname', p.nickname, 'hidden', p.hidden,
    'my_word', split_part(coalesce(p.half_word, ''), '#', 2),
    'find_word', case when i is null then null when split_part(p.half_word, '#', 3) = 'A' then pw[i][2] else pw[i][1] end);
end $$;

grant execute on function set_hidden(uuid,uuid,boolean), my_checkins(uuid), resume_checkin(uuid,uuid) to anon, authenticated;
