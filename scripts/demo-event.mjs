// Creates the judges' demo event through the real path: AI parse -> publish_event (host-claimed, live status).
// usage: node scripts/demo-event.mjs   (reads .env.local; adds the host secret to scripts/.host-secrets.json)
import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

for (const l of fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}
const { parseAnnouncement } = await import('../api/parse.js')
const db = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY)
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' })

const text = `Pizza & Game Jam Kickoff, hosted by Night Owl Game Dev Club. TONIGHT in Warnock Engineering (WEB) room 1230, running until 11:59 PM. Free pizza (while it lasts), stickers and a pile of board games. Step-free entrance on the north side with an elevator. Come solo, leave with a team!`
const { event: ev } = await parseAnnouncement(text, today)
console.log('AI read:', ev.title, '·', ev.building_code, ev.room, '·', ev.start, '→', ev.end, '· needs review:', ev.needs_review.join(',') || 'none')

// The organizer's review step: confirm what the demo needs.
const end = new Date(`${today}T23:59:00-07:00`).toISOString()
const off = (type, text, status) => ({ type, text, status })
const p = {
  title: 'Pizza & Game Jam Kickoff', host: ev.host || 'Night Owl Game Dev Club',
  start_at: ev.start || new Date().toISOString(), end_at: end, building_code: 'WEB', room: '1230',
  offerings: [off('food', 'Pizza', 'available'), off('swag', 'Stickers', 'available'), off('games', 'Board games', 'advertised')],
  access: { ...ev.access, step_free: 'yes', captions_asl: 'unknown' }, source_text: text,
}
if (ev.building_code !== 'WEB') console.log(`note: AI picked ${ev.building_code}; organizer review set WEB`)
const { data, error } = await db.rpc('publish_event', { p })
if (error) throw new Error(error.message)
const file = new URL('./.host-secrets.json', import.meta.url)
const secrets = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
secrets[data.event_id] = { title: p.title, host_secret: data.host_secret, demo: true }
fs.writeFileSync(file, JSON.stringify(secrets, null, 2))
console.log(`event: ${data.event_id}\nhost link: <origin>/#/host/${data.event_id}?k=${data.host_secret}\ncheck-in:  <origin>/#/checkin/${data.event_id}`)
