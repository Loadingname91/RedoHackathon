// Put synthetic demo data in the live database so the app looks used. Everything is tagged and removable.
// usage: node scripts/seed-synthetic.mjs          (re-runnable: removes its old rows first, then adds fresh ones)
//        node scripts/seed-synthetic.mjs --clean  (removes every synthetic row, adds nothing)
// Tags: fake device ids start with 5e1f0000-, fake events have source_text starting with "[synthetic]".
// Real events never get fake feedback; fake people only check in to events that are on now.
import fs from 'node:fs'
import pg from 'pg'
import { rng, pick, rate, makeStudents, SYNTH_PREFIX } from './synthetic.mjs'

for (const l of fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}
if (!process.env.SUPABASE_DB_URL) throw new Error('SUPABASE_DB_URL missing from .env.local')
const TAG = '[synthetic] demo data from scripts/seed-synthetic.mjs'
const rand = rng(7)
const students = makeStudents(rand, 300)

const PAST = [ // title, host, building, offerings
  ['Late Night Pizza & Smash', 'Crimson Gaming', 'UNION', ['food', 'games']],
  ['Intro to React Workshop', 'Women in Computing', 'WEB', ['workshop', 'food']],
  ['Open Mic & Cocoa', 'Union Programming Council', 'UNION', ['music', 'food']],
  ['Ski Swap Social', 'U Ski & Board Club', 'SFEBB', ['swag', 'networking']],
  ['Hack Night: Build a Bot', 'ACM @ U', 'MEB', ['workshop', 'prizes']],
  ['Indie Film Screening + Q&A', 'Film Studies Society', 'JFB', ['speaker', 'food']],
  ['Board Game Bonanza', 'Tabletop Club', 'MLIB', ['games', 'prizes']],
  ['Trailhead Meetup Planning', 'Outdoor Adventure Club', 'KV', ['networking', 'swag']],
  ['Watercolor Night', 'Art Collective', 'LS', ['workshop', 'music']],
  ['Startup Founder Talk', 'Lassonde Entrepreneurs', 'SFEBB', ['speaker', 'networking']],
  ['Taco Tuesday Mixer', 'Latinx Student Union', 'UNION', ['food', 'music']],
  ['Robotics Demo Day', 'Robotics Club', 'CSC', ['prizes', 'speaker', 'swag']],
]
const COMMENTS = {
  3: ['Loved it, would go again', 'Met two people from my major', 'Food went fast but it was worth it', 'Super welcoming', 'Best event I have been to this semester',
    'The organizers were really friendly', 'Came alone and left with a group chat', 'Perfect length, not too long', 'Find your half was a great icebreaker'],
  2: ['It was fine, a bit crowded', 'Okay, started late', 'Good idea, needs more seating', 'Fun but hard to hear', 'Would come again if there were more snacks', 'A bit short'],
  1: ['Hard to find the room', 'Not what the flyer said', 'Too loud to talk to anyone', 'Food was gone when I got there', 'Felt cliquey'],
}
const NICKS = ['Comet', 'Nova', 'Orbit', 'Vega', 'Pulsar', 'Lumen', 'Quill', 'Juniper', 'Atlas', 'Lyra', 'Sirius', 'Halley', 'Rigel', 'Ember']

const db = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } })
await db.connect()
const q = (s, v) => db.query(s, v)
try {
  await q('begin')
  const like = SYNTH_PREFIX + '%'
  const gone = await q(`delete from events where source_text like '[synthetic]%'`)
  await q(`delete from constellations where exists (select 1 from unnest(devices) d where d::text like $1)`, [like])
  await q(`delete from participants where device_id::text like $1`, [like]) // cascades connections + secrets
  await q(`delete from checkin_log where device_id::text like $1`, [like])
  await q(`delete from feedback where device_id::text like $1`, [like])
  await q(`delete from bonds where device_a::text like $1 or device_b::text like $1`, [like])
  console.log(`removed old synthetic data (${gone.rowCount} events)`)

  if (!process.argv.includes('--clean')) {
    // 1) Past events with check-ins and feedback, so host feedback and "worth going" have something to show.
    const links = []
    let ratings = 0
    for (const [k, [title, host, building, offers]] of PAST.entries()) {
      const start = new Date(Date.now() - (2 + k * 1.5) * 86400e3); start.setUTCHours(1, 0, 0, 0) // ~6 PM Denver
      const offerings = offers.map((t) => ({ type: t, text: t, status: 'finished' }))
      const { rows: [e] } = await q(`insert into events (title, host, start_at, end_at, building_code, offerings, access, source_text, source)
        values ($1,$2,$3,$4,$5,$6,'{}',$7,'host') returning id`, [title, host, start, new Date(start.getTime() + 2 * 3600e3), building, JSON.stringify(offerings), TAG])
      const { rows: [s] } = await q(`insert into event_secrets values ($1, gen_random_uuid()) returning secret`, [e.id])
      if (k < 2) links.push(`${title}: #/host/${e.id}?k=${s.secret}`)
      for (const st of pick(rand, students, 15 + Math.floor(rand() * 26))) {
        const r = rate(rand, st.interests, offers)
        const comment = rand() < 0.3 ? pick(rand, COMMENTS[r], 1)[0] : null
        await q(`insert into checkin_log values ($1,$2) on conflict do nothing`, [e.id, st.device])
        await q(`insert into feedback values ($1,$2,$3,$4, $5)`, [e.id, st.device, r, comment, new Date(start.getTime() + 3 * 3600e3)])
        ratings++
      }
    }
    console.log(`added ${PAST.length} past events with ${ratings} ratings`)

    // 2) People at the event(s) on right now: counts, stars, Find-your-half pairs, a few lines and constellations.
    const { rows: live } = await q(`select id, title from events where start_at <= now() and coalesce(end_at, start_at + interval '2 hours') > now()
      and coalesce(source_text,'') not like '[synthetic]%' order by start_at`)
    for (const ev of live) {
      const here = pick(rand, students, 14)
      const pids = []
      for (const [k, st] of here.entries()) {
        const { rows: [r] } = await q(`select check_in($1,$2,$3,$4) r`, [ev.id, st.device, NICKS[k % NICKS.length], st.interests])
        pids.push({ id: r.r.participant_id, device: st.device })
      }
      // Two triangles of confirmed connections, each named as a constellation.
      for (const [g, name] of [[0, 'Pizza Triangle'], [3, 'Delicate Arch']]) {
        const tri = pids.slice(g, g + 3)
        for (const [a, b] of [[0, 1], [1, 2], [0, 2]]) {
          await q(`insert into connections (event_id, a, b, prompt, a_confirmed, b_confirmed) values ($1,$2,$3,'Rate the pizza together',true,true)`, [ev.id, tri[a].id, tri[b].id])
          const [x, y] = [tri[a].device, tri[b].device].sort()
          await q(`insert into bonds (device_a, device_b, event_id) values ($1,$2,$3) on conflict do nothing`, [x, y, ev.id])
        }
        await q(`insert into constellations (event_id, name, members, devices) values ($1,$2,$3,$4)`, [ev.id, name, tri.map((p) => p.id), tri.map((p) => p.device)])
      }
      console.log(`checked 14 synthetic students in to "${ev.title}" with 6 connections and 2 constellations`)
    }
    if (!live.length) console.log('no event is on right now, so no live check-ins were added (re-run during an event)')
    console.log('host links to see feedback results:\n  ' + links.join('\n  '))
  }
  await q('commit')
} catch (e) {
  await q('rollback'); throw e
} finally { await db.end() }
