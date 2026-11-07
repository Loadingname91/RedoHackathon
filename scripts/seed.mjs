// Seed 6-8 real upcoming U events: Campus Connect iCal feed -> same AI parse as the app -> publish_event.
// usage: node scripts/seed.mjs [--dry]   (reads .env.local; writes host secrets to scripts/.host-secrets.json)
import fs from 'node:fs'
import ICAL from 'ical.js'
import { createClient } from '@supabase/supabase-js'

for (const l of fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}
const { parseAnnouncement } = await import('../api/parse.js')
const buildings = JSON.parse(fs.readFileSync(new URL('../src/data/buildings.json', import.meta.url), 'utf8'))
const db = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY)
const DRY = process.argv.includes('--dry')
const WANT = 8, MAX_TRIES = 20

const FALLBACK = [ // used only if the feed can't be read
  'Board Game Night + Pizza. Technical Coding Club. Friday 6-8pm, Warnock Engineering Building (WEB) 1230. Free pizza, all skill levels welcome.',
  'Women in Computing study social, Sunday 2-4pm at the Marriott Library. Snacks and coffee provided. Quiet study space available.',
  'Data Science Club: intro to pandas workshop. Monday 5-6:30pm, Merrill Engineering Building. Bring a laptop. Free stickers.',
]

async function feedEvents() {
  const r = await fetch('https://campusconnect.utah.edu/ical/utah/ical_utah.ics', { redirect: 'follow', headers: { 'User-Agent': 'ConstellationU-hackathon-seed/0.1' } })
  if (!r.ok) throw new Error(`feed ${r.status}`)
  const comp = new ICAL.Component(ICAL.parse(await r.text()))
  const now = Date.now(), week = now + 7 * 864e5
  const names = buildings.flatMap((b) => b.names ?? []).map((n) => n.toLowerCase())
  return comp.getAllSubcomponents('vevent').map((v) => new ICAL.Event(v)).filter((e) => {
    const t = e.startDate?.toJSDate().getTime()
    const where = `${e.location ?? ''} ${e.description ?? ''}`.toLowerCase()
    return t > now && t < week && !/online|zoom|virtual|asia campus|test event|check-?in\b|check out/i.test(`${e.summary} ${e.location}`)
      && names.some((n) => n.length > 3 && where.includes(n)) // only campus buildings we can place
  }).filter((e, i, all) => all.findIndex((x) => x.summary === e.summary) === i) // one per recurring title
    .map((e) => [
    e.summary,
    `When: ${e.startDate.toJSDate().toLocaleString('en-US', { timeZone: 'America/Denver' })} to ${e.endDate?.toJSDate().toLocaleString('en-US', { timeZone: 'America/Denver' }) ?? '?'}`,
    `Where: ${e.location ?? ''}`,
    `Organizer: ${e.component.getFirstPropertyValue('organizer') ?? ''}`,
    String(e.description ?? '').slice(0, 2500),
  ].join('\n'))
}

let texts
try { texts = await feedEvents(); console.log(`feed: ${texts.length} placeable candidates`) }
catch (e) { console.log(`feed unavailable (${e.message}); using fallback announcements`); texts = FALLBACK }

const secretsFile = new URL('./.host-secrets.json', import.meta.url)
const secrets = fs.existsSync(secretsFile) ? JSON.parse(fs.readFileSync(secretsFile, 'utf8')) : {}
let published = 0
for (const text of texts.slice(0, MAX_TRIES)) {
  if (published >= WANT) break
  const { event: ev, duplicates } = await parseAnnouncement(text, new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' })).catch((e) => ({ event: null, err: e }))
  if (!ev) continue
  if (ev.building_code === 'unknown' || !ev.start) { console.log(`skip (no building/time): ${ev.title}`); continue }
  if (duplicates?.length) { console.log(`skip (already on map): ${ev.title}`); continue }
  console.log(`${DRY ? 'would publish' : 'publish'}: ${ev.title} · ${ev.building_code} ${ev.room ?? ''} · ${ev.start} · ${ev.offerings.map((o) => o.type).join(',')}`)
  if (DRY) { published++; continue }
  const { data, error } = await db.rpc('publish_event', { p: {
    title: ev.title, host: ev.host, start_at: ev.start, end_at: ev.end, building_code: ev.building_code,
    room: ev.room, offerings: ev.offerings, access: ev.access, source_text: ev.source_text, source: 'campus_connect' } })
  if (error) { console.log(`  failed: ${error.message}`); continue }
  secrets[data.event_id] = { title: ev.title, host_secret: data.host_secret }
  published++
}
if (!DRY) fs.writeFileSync(secretsFile, JSON.stringify(secrets, null, 2))
console.log(`done: ${published} ${DRY ? 'would be ' : ''}published`)
