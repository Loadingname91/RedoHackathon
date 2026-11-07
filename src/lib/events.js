import { supabase, rpc, EVENT_COLS } from './supabase.js'

// buildings.json is owned by Lane B; glob keeps the build working before it exists.
const found = Object.values(import.meta.glob('../data/buildings.json', { eager: true, import: 'default' }))[0]
export const BUILDINGS = Array.isArray(found) ? found : found?.buildings ?? []

export const OFFERING_TYPES = ['food', 'swag', 'music', 'games', 'speaker', 'workshop', 'prizes', 'networking', 'other']
export const STATUSES = [
  { id: 'advertised', label: 'Advertised' },
  { id: 'available', label: 'Available' },
  { id: 'running_low', label: 'Running low' },
  { id: 'finished', label: 'Finished' },
]
// Offerings that can run out get a live status; talks and music don't.
export const LIMITED = new Set(['food', 'swag', 'prizes'])

export async function getEvent(id) {
  const { data, error } = await supabase.from('events').select(EVENT_COLS).eq('id', id).single()
  if (error) throw new Error(error.message)
  return data
}

export async function parseAnnouncement(text) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' })
  const r = await fetch('/api/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, today }) })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(body.error ?? 'Could not read the announcement.')
  return body
}

export const publishEvent = (ev) => rpc('publish_event', { p: ev })
export const setOfferings = (eventId, secret, offerings) => rpc('set_offerings', { p_event: eventId, p_secret: secret, p_offerings: offerings })

// After the end time, limited offerings are marked finished (organizers forget).
export function autoFinish(offerings, endAt, now = Date.now()) {
  if (!endAt || now < Date.parse(endAt)) return null
  if (!offerings.some((o) => LIMITED.has(o.type) && o.status !== 'finished')) return null
  return offerings.map((o) => (LIMITED.has(o.type) ? { ...o, status: 'finished' } : o))
}

// ISO <-> <input type="datetime-local">. shortcut: uses the device time zone (fine on campus devices); use a tz library if hosts travel.
export const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso); if (Number.isNaN(d)) return ''
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
export const fromLocalInput = (v) => (v ? new Date(v).toISOString() : null)

export const claimEvent = (id, secret) => rpc('claim_event', { p_event: id, p_secret: secret })
export const listQuestions = (id, secret) => rpc('host_questions_list', { p_event: id, p_secret: secret })
export const answerQuestion = (id, secret, qid, answer) => rpc('answer_question', { p_event: id, p_secret: secret, p_question: qid, p_answer: answer })
export const feedbackSummary = (id, secret) => rpc('feedback_summary', { p_event: id, p_secret: secret })
export const publishMicro = (device, ev, visibility) => rpc('publish_micro_event', { p_device: device, p: ev, p_visibility: visibility })

// Event ids this device hosts (host secrets saved in this browser).
export function hostedIds() {
  try { return Object.keys(JSON.parse(localStorage.getItem('cu.host')) ?? {}) } catch { return [] }
}
export const isLive = (ev, now = Date.now()) => (!ev.start_at || Date.parse(ev.start_at) <= now + 36e5) && (!ev.end_at || Date.parse(ev.end_at) > now)
