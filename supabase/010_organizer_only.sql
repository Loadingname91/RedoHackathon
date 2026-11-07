-- Only organizers and admins publish events through the app. Students post micro-events (publish_micro_event),
-- which unlock at 3 connections. Direct database scripts (seed, tests) are still allowed. Run after 009.
create or replace function publish_event(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e events; s uuid := gen_random_uuid();
begin
  -- session_user is 'authenticator' for app/API calls; anything else is a direct DB connection (seed/test scripts).
  if session_user = 'authenticator' and coalesce((select role from profiles where user_id = auth.uid()), 'student') not in ('organizer','admin') then
    raise exception 'only organizers can publish club events. Students can host a meetup after 3 connections';
  end if;
  insert into events (title, host, start_at, end_at, building_code, room, offerings, access, source_text, source)
  values (p->>'title', p->>'host', (p->>'start_at')::timestamptz, (p->>'end_at')::timestamptz,
          coalesce(p->>'building_code','unknown'), p->>'room',
          coalesce(p->'offerings','[]'), coalesce(p->'access','{}'), left(p->>'source_text', 4000),
          case when p->>'source' = 'campus_connect' then 'campus_connect' else 'host' end)
  returning * into e;
  insert into event_secrets values (e.id, s);
  if auth.uid() is not null then insert into event_hosts values (e.id, auth.uid()) on conflict do nothing; end if;
  return jsonb_build_object('event_id', e.id, 'host_secret', s);
end $$;
