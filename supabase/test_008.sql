-- Self-check for server-side check-in state (rolls back).
begin;
do $$
declare ev jsonb; a jsonb; r jsonb; da uuid := '00000000-0000-0000-0000-0000000000d1';
begin
  ev := publish_event('{"title":"State test","building_code":"WEB"}');
  a := check_in((ev->>'event_id')::uuid, da, 'Fry', '{games}');
  assert jsonb_array_length(my_checkins(da)) = 1, 'FAIL: my_checkins after check-in';
  r := resume_checkin(da, (ev->>'event_id')::uuid);
  assert r->>'secret' = a->>'secret' and r->>'my_word' = 'FRY' and r->>'find_word' = 'SAUCE', 'FAIL: resume ' || r::text;
  perform set_hidden((a->>'participant_id')::uuid, (a->>'secret')::uuid, true);
  assert (my_checkins(da)->0->>'hidden')::boolean, 'FAIL: hidden not saved';
  perform set_hidden((a->>'participant_id')::uuid, (a->>'secret')::uuid, false);
  perform leave_event((a->>'participant_id')::uuid, (a->>'secret')::uuid);
  assert jsonb_array_length(my_checkins(da)) = 0, 'FAIL: still checked in after leaving';
  begin perform resume_checkin(da, (ev->>'event_id')::uuid); raise exception 'FAIL: resumed after leaving';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  raise notice 'ALL CHECKS PASSED';
end $$;
rollback;
