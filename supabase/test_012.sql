-- Self-check for ask-to-connect nudges (rolls back).
begin;
do $$
declare ev uuid; a jsonb; b jsonb; c jsonb; d jsonb; r jsonb; req uuid;
  da uuid := '00000000-0000-0000-0000-0000000002a1'; db uuid := '00000000-0000-0000-0000-0000000002a2';
  dc uuid := '00000000-0000-0000-0000-0000000002a3'; dd uuid := '00000000-0000-0000-0000-0000000002a4';
begin
  ev := (publish_event('{"title":"Nudge test","building_code":"WEB"}')->>'event_id')::uuid;
  a := check_in(ev, da, 'Ann', '{}'); b := check_in(ev, db, 'Ben', '{}');
  c := check_in(ev, dc, 'Cal', '{}'); d := check_in(ev, dd, 'Dee', '{}');

  -- Ann asks Ben: Ben sees it, Ann sees it pending
  perform request_connection((a->>'participant_id')::uuid, (a->>'secret')::uuid, (b->>'participant_id')::uuid);
  r := my_requests((b->>'participant_id')::uuid, (b->>'secret')::uuid);
  assert jsonb_array_length(r->'incoming') = 1 and r->'incoming'->0->>'nickname' = 'Ann', 'FAIL: Ben gets the nudge';
  req := (r->'incoming'->0->>'id')::uuid;
  -- Ben says "Not now": gone for Ben, still "pending" for Ann (silent no)
  perform respond_request((b->>'participant_id')::uuid, (b->>'secret')::uuid, req, false);
  assert jsonb_array_length(my_requests((b->>'participant_id')::uuid, (b->>'secret')::uuid)->'incoming') = 0, 'FAIL: declined nudge gone';
  assert my_requests((a->>'participant_id')::uuid, (a->>'secret')::uuid)->'outgoing'->0->>'status' = 'pending', 'FAIL: decline is silent';
  -- asking again right away does not re-nudge Ben
  perform request_connection((a->>'participant_id')::uuid, (a->>'secret')::uuid, (b->>'participant_id')::uuid);
  assert jsonb_array_length(my_requests((b->>'participant_id')::uuid, (b->>'secret')::uuid)->'incoming') = 0, 'FAIL: no re-nudge within 10 min';

  -- Cal asks Ann, Ann says yes: Cal sees accepted, then clears it
  perform request_connection((c->>'participant_id')::uuid, (c->>'secret')::uuid, (a->>'participant_id')::uuid);
  req := (my_requests((a->>'participant_id')::uuid, (a->>'secret')::uuid)->'incoming'->0->>'id')::uuid;
  perform respond_request((a->>'participant_id')::uuid, (a->>'secret')::uuid, req, true);
  assert my_requests((c->>'participant_id')::uuid, (c->>'secret')::uuid)->'outgoing'->0->>'status' = 'accepted', 'FAIL: asker sees yes';
  perform clear_request((c->>'participant_id')::uuid, (c->>'secret')::uuid, req);
  assert jsonb_array_length(my_requests((c->>'participant_id')::uuid, (c->>'secret')::uuid)->'outgoing') = 0, 'FAIL: cleared';
  -- only the person asked can answer
  perform respond_request((c->>'participant_id')::uuid, (c->>'secret')::uuid, req, false);
  assert (select status from connect_requests where id = req) = 'seen', 'FAIL: asker cannot answer own request';

  -- Both ask each other: becomes a yes
  perform request_connection((c->>'participant_id')::uuid, (c->>'secret')::uuid, (d->>'participant_id')::uuid);
  perform request_connection((d->>'participant_id')::uuid, (d->>'secret')::uuid, (c->>'participant_id')::uuid);
  assert my_requests((c->>'participant_id')::uuid, (c->>'secret')::uuid)->'outgoing'->0->>'status' = 'accepted', 'FAIL: mutual ask is a yes';
  assert jsonb_array_length(my_requests((d->>'participant_id')::uuid, (d->>'secret')::uuid)->'incoming') = 0, 'FAIL: no leftover nudge on mutual ask';

  -- Blocked: asking silently does nothing
  insert into blocks values (dd, db);
  perform request_connection((b->>'participant_id')::uuid, (b->>'secret')::uuid, (d->>'participant_id')::uuid);
  assert jsonb_array_length(my_requests((d->>'participant_id')::uuid, (d->>'secret')::uuid)->'incoming') = 0, 'FAIL: blocked person cannot nudge';

  -- Hidden people can't be asked; wrong secret is refused
  perform set_hidden((d->>'participant_id')::uuid, (d->>'secret')::uuid, true);
  begin perform request_connection((a->>'participant_id')::uuid, (a->>'secret')::uuid, (d->>'participant_id')::uuid); raise exception 'FAIL: asked a hidden person';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin perform my_requests((a->>'participant_id')::uuid, gen_random_uuid()); raise exception 'FAIL: wrong secret read requests';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  raise notice 'ALL CHECKS PASSED';
end $$;
rollback;
