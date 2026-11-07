// Device identity + per-event sessions, kept in localStorage. All access wrapped: storage can be blocked.
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

// Signed in with Google: your stars follow your account (cu.uid). Otherwise a random id for this phone.
// shortcut: the id is still sent by the client; move check_in/my_sky to auth.uid() server-side after the hackathon.
export function deviceId() {
  const uid = read('cu.uid', null)
  if (uid) return uid
  let id = read('cu.device', null)
  if (!id) { id = crypto.randomUUID(); write('cu.device', id) }
  return id
}

// { [eventId]: { participant_id, secret, nickname } }
export const getSession = (eventId) => read('cu.sessions', {})[eventId] ?? null
export const setSession = (eventId, s) => write('cu.sessions', { ...read('cu.sessions', {}), [eventId]: s })
export const clearSession = (eventId) => { const all = read('cu.sessions', {}); delete all[eventId]; write('cu.sessions', all) }

// Host secrets: { [eventId]: secret }. A host link is #/host/<eventId>?k=<secret>; opening it on another device saves it (fixes H1).
export const getHostSecret = (eventId) => read('cu.host', {})[eventId] ?? null
export const setHostSecret = (eventId, secret) => {
  write('cu.host', { ...read('cu.host', {}), [eventId]: secret })
  // Signed-in organizers keep their events on their account (no-op when signed out).
  if (read('cu.uid', null)) import('./supabase.js').then(({ supabase }) => supabase.rpc('link_host_event', { p_event: eventId, p_secret: secret })).catch(() => {})
}
export const allHostSecrets = () => read('cu.host', {})
export const setUid = (uid) => { try { uid ? localStorage.setItem('cu.uid', JSON.stringify(uid)) : localStorage.removeItem('cu.uid') } catch {} }
export const hostLink = (eventId, secret) => `${location.origin}/#/host/${eventId}?k=${secret}`

export const prefs = () => read('cu.prefs', { calm: false, sound: false, stepFree: false, freeUntil: null })
export const setPrefs = (p) => { write('cu.prefs', { ...prefs(), ...p }); document.documentElement.dataset.calm = prefs().calm ? '1' : '0' }
export const allSessions = () => read('cu.sessions', {})

// Sign-out must work offline too. Remove only this app's keys (rather than
// clearing the whole origin) so a stale profile, hosted event, or test session
// can never reopen after the public home page loads.
export function clearLocalAppState() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key?.startsWith('cu.')) localStorage.removeItem(key)
    }
    sessionStorage.removeItem('cu.next')
  } catch {}
  delete document.documentElement.dataset.calm
}
