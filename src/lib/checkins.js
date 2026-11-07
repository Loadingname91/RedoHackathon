import { rpc } from './supabase.js'
import { deviceId, allSessions, setSession, clearSession } from './identity.js'

// The server is the truth for check-ins. Pull it, pick up check-ins made on another device (same account),
// and drop local ones the server no longer has (left elsewhere, expired, event over).
export async function syncCheckins() {
  const server = await rpc('my_checkins', { p_device: deviceId() })
  const local = allSessions()
  const ids = new Set(server.map((c) => c.event_id))
  for (const id of Object.keys(local)) if (!ids.has(id)) clearSession(id)
  for (const c of server) {
    if (!local[c.event_id] || local[c.event_id].participant_id !== c.participant_id) {
      try { setSession(c.event_id, await rpc('resume_checkin', { p_device: deviceId(), p_event: c.event_id })) } catch {}
    }
  }
  return server
}
