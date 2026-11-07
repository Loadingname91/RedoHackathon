-- Self-check for 002 (rolls back).
begin;
do $$
declare ev jsonb; a jsonb; b jsonb; c jsonb; code text;
begin
  ev := publish_event('{"title":"Half test","building_code":"WEB"}');
  a := check_in((ev->>'event_id')::uuid, '00000000-0000-0000-0000-00000000000a', 'Fry', '{games}');
  b := check_in((ev->>'event_id')::uuid, '00000000-0000-0000-0000-00000000000b', 'Sauce', '{games}');
  c := check_in((ev->>'event_id')::uuid, '00000000-0000-0000-0000-00000000000c', 'Comet', '{music}');
  assert a->>'my_word' = 'FRY' and a->>'find_word' = 'SAUCE', 'FAIL: first half ' || a::text;
  assert b->>'my_word' = 'SAUCE' and b->>'find_word' = 'FRY' and (b->>'partner_waiting')::boolean, 'FAIL: second half ' || b::text;
  assert c->>'my_word' = 'DELICATE', 'FAIL: new pair ' || c::text;
  perform block_person((a->>'participant_id')::uuid, (a->>'secret')::uuid, (b->>'participant_id')::uuid);
  code := new_connect_code((a->>'participant_id')::uuid, (a->>'secret')::uuid);
  begin perform redeem_code((b->>'participant_id')::uuid, (b->>'secret')::uuid, code); raise exception 'FAIL: blocked person connected';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  perform report_person((c->>'participant_id')::uuid, (c->>'secret')::uuid, (a->>'participant_id')::uuid, 'test');
  assert (select count(*) from reports) >= 1, 'FAIL: report not saved';
  perform check_in((ev->>'event_id')::uuid, '00000000-0000-0000-0000-00000000000d', 'Fry', '{}');
  assert exists (select 1 from participants where event_id = (ev->>'event_id')::uuid and nickname = 'Fry 2'), 'FAIL: duplicate nickname not numbered';
  raise notice 'ALL CHECKS PASSED';
end $$;
rollback;
