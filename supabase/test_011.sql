-- Self-check for unique nicknames at an event (rolls back).
begin;
do $$
declare ev uuid; n text;
  d1 uuid := '00000000-0000-0000-0000-0000000001a1'; d2 uuid := '00000000-0000-0000-0000-0000000001a2';
  d3 uuid := '00000000-0000-0000-0000-0000000001a3'; d4 uuid := '00000000-0000-0000-0000-0000000001a4';
  d5 uuid := '00000000-0000-0000-0000-0000000001a5';
begin
  ev := (publish_event('{"title":"Nick test","building_code":"WEB"}')->>'event_id')::uuid;
  assert check_in(ev, d1, 'Nova', '{}')->>'nickname' = 'Nova', 'FAIL: first Nova keeps the name';
  assert check_in(ev, d2, 'nova', '{}')->>'nickname' = 'nova 2', 'FAIL: case-insensitive duplicate gets 2';
  assert check_in(ev, d3, 'Nova', '{}')->>'nickname' = 'Nova 3', 'FAIL: third Nova gets 3';
  delete from participants where device_id = d2 and event_id = ev; -- "nova 2" leaves
  assert check_in(ev, d4, 'Nova', '{}')->>'nickname' = 'Nova 2', 'FAIL: reuses the free number, not a taken one';
  assert check_in(ev, d5, 'Nova 3', '{}')->>'nickname' = 'Nova 3 2', 'FAIL: typing a taken numbered name';
  -- checking in again on the same device keeps your own name
  assert check_in(ev, d1, 'Nova', '{}')->>'nickname' = 'Nova', 'FAIL: re-check-in keeps your name';
  -- long names stay within 24 characters
  n := check_in(ev, d2, repeat('x', 24), '{}')->>'nickname';
  n := check_in(ev, d3, repeat('x', 24), '{}')->>'nickname';
  assert n = repeat('x', 22) || ' 2' and length(n) <= 24, 'FAIL: long duplicate trimmed to fit: ' || n;
  -- the database refuses a duplicate even outside check_in
  begin
    update participants set nickname = 'NOVA' where device_id = d4 and event_id = ev;
    raise exception 'FAIL: duplicate allowed by update';
  exception when unique_violation then null; end;
  assert (select count(*) from participants where event_id = ev) = (select count(distinct lower(nickname)) from participants where event_id = ev), 'FAIL: duplicates exist';
  raise notice 'ALL CHECKS PASSED';
end $$;
rollback;
