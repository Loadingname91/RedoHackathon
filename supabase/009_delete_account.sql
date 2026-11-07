-- "Delete my account": removes the signed-in user and everything tied to them. Run after 008. Safe to re-run.
-- Kept on purpose: reports they filed or received (safety records), with no profile left to link them to a person.
create or replace function delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'sign in first'; end if;
  delete from participants where device_id = me;            -- current check-ins (lines go with them)
  delete from bonds where me in (device_a, device_b);       -- people you've met, shared handles
  delete from feedback where device_id = me;
  delete from checkin_log where device_id = me;
  delete from blocks where blocker = me;
  update constellations set devices = array_remove(devices, me) where me = any(devices);
  delete from auth.users where id = me;                     -- cascades: profile, hosted-event links
end $$;
revoke all on function delete_my_account() from public, anon;
grant execute on function delete_my_account() to authenticated;
