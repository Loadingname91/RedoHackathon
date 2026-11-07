-- Ask to connect: tap someone's star, they get a nudge and choose "Show my code" or "Not now".
-- A request never makes a line by itself: a yes leads to the usual in-person code swap and both confirming.
-- "Not now" and blocks are silent: the asker only ever sees their own request as pending. Run after 011. Safe to re-run.

create table if not exists connect_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events on delete cascade,
  from_id uuid not null references participants on delete cascade,
  to_id uuid not null references participants on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'seen')),
  created_at timestamptz not null default now(),
  check (from_id <> to_id),
  unique (from_id, to_id)
);
alter table connect_requests enable row level security; -- no policies: who asked whom is read only through my_requests

-- Ask. Silent no-op when blocked either way, so the asker learns nothing. Asking again after "Not now" waits 10 minutes.
create or replace function request_connection(p_id uuid, p_secret uuid, p_other uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me participants; o participants;
begin
  me := _who(p_id, p_secret);
  select * into o from participants where id = p_other and event_id = me.event_id and expires_at > now() and not hidden;
  if o.id is null or o.id = me.id then raise exception 'they are not at this event'; end if;
  if exists (select 1 from connections where (a = me.id and b = o.id) or (a = o.id and b = me.id)) then raise exception 'already connected'; end if;
  if (select count(*) from connect_requests where from_id = me.id and status = 'pending' and created_at > now() - interval '10 minutes') >= 5
    then raise exception 'you have 5 requests waiting. Give people a moment to answer'; end if;
  if exists (select 1 from blocks b where (b.blocker = o.device_id and b.blocked = me.device_id) or (b.blocker = me.device_id and b.blocked = o.device_id))
    then return; end if;
  -- they already asked you: that's a yes from both, so accept theirs instead of making a second request
  if exists (select 1 from connect_requests where from_id = o.id and to_id = me.id and status = 'pending') then
    update connect_requests set status = 'accepted' where from_id = o.id and to_id = me.id;
    return;
  end if;
  insert into connect_requests (event_id, from_id, to_id) values (me.event_id, me.id, o.id)
  on conflict (from_id, to_id) do update set status = 'pending', created_at = now()
    where connect_requests.status <> 'pending' and connect_requests.created_at < now() - interval '10 minutes';
end $$;

-- Incoming: pending requests to me. Outgoing: my requests, where "declined" is reported as "pending" (silent no).
create or replace function my_requests(p_id uuid, p_secret uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare me participants;
begin
  me := _who(p_id, p_secret);
  return jsonb_build_object(
    'incoming', coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'from_id', r.from_id, 'nickname', p.nickname,
                 'prefers_text', p.prefers_text, 'come_to_me', p.come_to_me) order by r.created_at)
      from connect_requests r join participants p on p.id = r.from_id
     where r.to_id = me.id and r.status = 'pending' and p.expires_at > now() and not p.hidden
       and not exists (select 1 from blocks b where (b.blocker = p.device_id and b.blocked = me.device_id) or (b.blocker = me.device_id and b.blocked = p.device_id))), '[]'),
    'outgoing', coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'to_id', r.to_id, 'nickname', p.nickname,
                 'status', case when r.status = 'declined' then 'pending' else r.status end) order by r.created_at)
      from connect_requests r join participants p on p.id = r.to_id
     where r.from_id = me.id and r.status <> 'seen'), '[]'));
end $$;

-- The person asked answers. Only they can.
create or replace function respond_request(p_id uuid, p_secret uuid, p_req uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = public as $$
declare me participants;
begin
  me := _who(p_id, p_secret);
  update connect_requests set status = case when p_accept then 'accepted' else 'declined' end
   where id = p_req and to_id = me.id and status = 'pending';
end $$;

-- The asker saw the "they said yes" nudge: stop showing it.
create or replace function clear_request(p_id uuid, p_secret uuid, p_req uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me participants;
begin
  me := _who(p_id, p_secret);
  update connect_requests set status = 'seen' where id = p_req and from_id = me.id and status = 'accepted';
end $$;

grant execute on function request_connection(uuid,uuid,uuid), my_requests(uuid,uuid), respond_request(uuid,uuid,uuid,boolean),
  clear_request(uuid,uuid,uuid) to anon, authenticated;
