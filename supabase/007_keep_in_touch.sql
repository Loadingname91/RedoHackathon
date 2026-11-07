-- Keep in touch: a lasting list of people you've met (nickname, event, date) and an optional handle that is only
-- revealed when BOTH people choose to share. Run after 006. Safe to re-run; keeps data.

alter table bonds add column if not exists id uuid not null default gen_random_uuid();
create unique index if not exists bonds_id on bonds (id);
alter table bonds add column if not exists nick_a text;
alter table bonds add column if not exists nick_b text;
alter table bonds add column if not exists event_title text;
alter table bonds add column if not exists handle_a text check (length(handle_a) <= 80); -- what device_a offers to share
alter table bonds add column if not exists handle_b text check (length(handle_b) <= 80);

-- Signed-in callers can only act as themselves; signed-out phones use their random device id.
create or replace function _me(p_device uuid) returns uuid language plpgsql stable as $$
begin
  if auth.uid() is not null and p_device is distinct from auth.uid() then raise exception 'not your account'; end if;
  if p_device is null then raise exception 'device id required'; end if;
  return p_device;
end $$;

-- confirm_connection now also records nicknames and the event name on the lasting bond.
create or replace function confirm_connection(p_id uuid, p_secret uuid, p_conn uuid, p_answer text default null)
returns void language plpgsql security definer set search_path = public as $$
declare me participants; c connections; pa participants; pb participants; t text;
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
    select * into pa from participants where id = c.a; select * into pb from participants where id = c.b;
    select title into t from events where id = c.event_id;
    if pa.device_id <> pb.device_id then
      insert into bonds (device_a, device_b, event_id, nick_a, nick_b, event_title)
      values (least(pa.device_id, pb.device_id), greatest(pa.device_id, pb.device_id), c.event_id,
              case when pa.device_id < pb.device_id then pa.nickname else pb.nickname end,
              case when pa.device_id < pb.device_id then pb.nickname else pa.nickname end, t)
      on conflict (device_a, device_b) do update set event_id = excluded.event_id, event_title = excluded.event_title,
        nick_a = excluded.nick_a, nick_b = excluded.nick_b;
    end if;
  end if;
end $$;

create or replace function my_connections(p_device uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare me uuid := _me(p_device);
begin
  return coalesce((select jsonb_agg(x order by x->>'met_at' desc) from (
    select jsonb_build_object(
      'id', b.id,
      'nickname', coalesce(case when b.device_a = me then b.nick_b else b.nick_a end, 'Someone you met'),
      'event', b.event_title, 'met_at', b.created_at,
      'my_handle', case when b.device_a = me then b.handle_a else b.handle_b end,
      -- their handle only when both of you chose to share
      'their_handle', case when b.handle_a is not null and b.handle_b is not null
                           then case when b.device_a = me then b.handle_b else b.handle_a end end,
      'they_shared', (case when b.device_a = me then b.handle_b else b.handle_a end) is not null and
                     (case when b.device_a = me then b.handle_a else b.handle_b end) is not null) x
    from bonds b where me in (b.device_a, b.device_b)) q), '[]');
end $$;

-- Share (or stop sharing with null) your handle on one connection.
create or replace function keep_in_touch(p_device uuid, p_bond uuid, p_handle text) returns void
language plpgsql security definer set search_path = public as $$
declare me uuid := _me(p_device); h text := nullif(left(trim(coalesce(p_handle, '')), 80), '');
begin
  update bonds set handle_a = case when device_a = me then h else handle_a end,
                   handle_b = case when device_b = me then h else handle_b end
   where id = p_bond and me in (device_a, device_b);
  if not found then raise exception 'not your connection'; end if;
end $$;

-- Remove a lasting connection for both people (they aren't told).
create or replace function forget_connection(p_device uuid, p_bond uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me uuid := _me(p_device);
begin delete from bonds where id = p_bond and me in (device_a, device_b); end $$;

grant execute on function my_connections(uuid), keep_in_touch(uuid,uuid,text), forget_connection(uuid,uuid) to anon, authenticated;
