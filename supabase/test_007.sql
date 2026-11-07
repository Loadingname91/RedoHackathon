-- Self-check for keep in touch (rolls back).
begin;
do $$
declare ev jsonb; a jsonb; b jsonb; code text; cid uuid; bond uuid; l jsonb;
  da uuid := '00000000-0000-0000-0000-0000000000a1'; db uuid := '00000000-0000-0000-0000-0000000000b1';
begin
  ev := publish_event('{"title":"Keep test","building_code":"WEB"}');
  a := check_in((ev->>'event_id')::uuid, da, 'Fry', '{games}'); b := check_in((ev->>'event_id')::uuid, db, 'Sauce', '{games}');
  code := new_connect_code((a->>'participant_id')::uuid, (a->>'secret')::uuid);
  cid := redeem_code((b->>'participant_id')::uuid, (b->>'secret')::uuid, code);
  perform confirm_connection((a->>'participant_id')::uuid, (a->>'secret')::uuid, cid);
  perform confirm_connection((b->>'participant_id')::uuid, (b->>'secret')::uuid, cid);
  perform leave_event((a->>'participant_id')::uuid, (a->>'secret')::uuid); -- event over for Fry
  l := my_connections(da);
  assert l->0->>'nickname' = 'Sauce' and l->0->>'event' = 'Keep test', 'FAIL: lasting list ' || l::text;
  bond := (l->0->>'id')::uuid;
  perform keep_in_touch(da, bond, '@fry_ig');
  assert my_connections(db)->0->>'their_handle' is null, 'FAIL: handle shown before both shared';
  perform keep_in_touch(db, bond, 'sauce#1234');
  assert my_connections(db)->0->>'their_handle' = '@fry_ig' and my_connections(da)->0->>'their_handle' = 'sauce#1234', 'FAIL: mutual share';
  perform keep_in_touch(da, bond, null);
  assert my_connections(db)->0->>'their_handle' is null, 'FAIL: stop sharing';
  begin perform keep_in_touch('00000000-0000-0000-0000-0000000000c1', bond, 'x'); raise exception 'FAIL: outsider shared';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  perform forget_connection(db, bond);
  assert jsonb_array_length(my_connections(da)) = 0, 'FAIL: forget';
  raise notice 'ALL CHECKS PASSED';
end $$;
rollback;
