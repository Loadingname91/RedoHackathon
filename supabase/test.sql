-- Self-check of the full flow. Runs in a transaction and rolls back, so it leaves no data.
begin;
do $$
declare ev jsonb; p1 jsonb; p2 jsonb; p3 jsonb; code text; c12 uuid; c23 uuid; ok boolean;
  id1 uuid; s1 uuid; id2 uuid; s2 uuid; id3 uuid; s3 uuid;
begin
  ev := publish_event('{"title":"Test night","building_code":"WEB"}');
  p1 := check_in((ev->>'event_id')::uuid, '00000000-0000-0000-0000-000000000001', 'Fry', '{games}');
  p2 := check_in((ev->>'event_id')::uuid, '00000000-0000-0000-0000-000000000002', 'Sauce', '{games}');
  p3 := check_in((ev->>'event_id')::uuid, '00000000-0000-0000-0000-000000000003', 'Comet', '{music}');
  id1 := p1->>'participant_id'; s1 := p1->>'secret';
  id2 := p2->>'participant_id'; s2 := p2->>'secret';
  id3 := p3->>'participant_id'; s3 := p3->>'secret';

  -- wrong secret is rejected
  begin perform new_connect_code(id1, gen_random_uuid()); raise exception 'FAIL: bad secret accepted';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;

  code := new_connect_code(id1, s1);
  c12 := redeem_code(id2, s2, code);
  -- a code can only be used once
  begin perform redeem_code(id3, s3, code); raise exception 'FAIL: code reused';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;

  -- one side confirming is not enough
  perform confirm_connection(id1, s1, c12, 'both want to make a game');
  select a_confirmed and b_confirmed into ok from connections where id = c12;
  assert not ok, 'FAIL: line shown after one confirm';
  -- an outsider cannot confirm for someone else
  begin perform confirm_connection(id3, s3, c12); raise exception 'FAIL: outsider confirmed';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  perform confirm_connection(id2, s2, c12);
  select a_confirmed and b_confirmed into ok from connections where id = c12;
  assert ok, 'FAIL: both confirmed but no line';

  -- constellation needs everyone connected
  begin perform name_constellation(id1, s1, array[id1,id2,id3], 'Too soon'); raise exception 'FAIL: unconnected member allowed';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  code := new_connect_code(id2, s2);
  c23 := redeem_code(id3, s3, code);
  perform confirm_connection(id2, s2, c23); perform confirm_connection(id3, s3, c23);
  perform name_constellation(id1, s1, array[id1,id2,id3], 'The Unfinished Game Studio');

  -- My sky counts lasting bonds
  assert (my_sky('00000000-0000-0000-0000-000000000002')->>'stars')::int = 2, 'FAIL: my_sky star count';
  assert jsonb_array_length(my_sky('00000000-0000-0000-0000-000000000001')->'constellations') = 1, 'FAIL: my_sky constellations';
  -- leaving removes you and your lines
  perform leave_event(id3, s3);
  assert not exists (select 1 from connections where id = c23), 'FAIL: lines kept after leaving';
  assert (my_sky('00000000-0000-0000-0000-000000000003')->>'stars')::int = 1, 'FAIL: bond lost after leaving';
  raise notice 'ALL CHECKS PASSED';
end $$;
select 'ALL CHECKS PASSED' as result;
rollback;
