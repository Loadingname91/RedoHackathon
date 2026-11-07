// Sync the Campus Connect iCal feed into events.
// POST {admin}                         -> admin "Sync now" (admin key from the Admin screen)
// GET  Authorization: Bearer CRON_SECRET -> Vercel cron; uses ADMIN_SYNC_KEY from env
import { createClient } from '@supabase/supabase-js'
import { fetchFeed, pickEvents, loadBuildings } from './_campusconnect.js'
import { parseAnnouncement } from './parse.js'

const MAX_AI = 10 // Claude calls per run, only for new events the name rules can't place

export async function runSync(admin) {
  const db = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY)
  const rpc = async (fn, args) => { const { data, error } = await db.rpc(fn, args); if (error) throw new Error(error.message); return data }
  await rpc('sync_runs_list', { p_admin: admin }) // throws "not an admin"
  const run = await rpc('sync_start', { p_admin: admin })
  const counts = { new: 0, updated: 0, unchanged: 0, ai_calls: 0 }
  let skipped = [], feed = { status: null }, error = null, picked = { candidates: [], inWindow: 0 }
  try {
    feed = await fetchFeed()
    if (!feed.events.length) throw new Error(`Feed returned HTTP ${feed.status} with no events`)
    const buildings = loadBuildings()
    picked = pickEvents(feed.events, buildings)
    skipped = picked.skipped
    const save = (c, building) => rpc('sync_upsert_event', { p_admin: admin, p_run: run, p: {
      uid: c.uid, title: c.title, host: c.host, start_at: c.start_at, end_at: c.end_at, building_code: building,
      room: c.room, offerings: c.offerings, source_text: c.text, source_url: c.source_url } })

    for (let i = 0; i < picked.candidates.length; i += 8) { // small batches: fast, but gentle on the database
      await Promise.all(picked.candidates.slice(i, i + 8).map(async (c) => {
        try {
          counts[await save(c, c.building)]++
        } catch (e) {
          if (!/building required/.test(e.message)) { skipped.push({ uid: c.uid, title: c.title, reason: `Save failed: ${e.message}` }); return }
          // New event the name rules couldn't place: ask Claude, within the per-run cap.
          if (counts.ai_calls >= MAX_AI) { skipped.push({ uid: c.uid, title: c.title, reason: 'Building not recognized (AI limit reached this run)' }); return }
          counts.ai_calls++
          const ev = (await parseAnnouncement(c.text).catch(() => null))?.event
          if (!ev || ev.building_code === 'unknown') { skipped.push({ uid: c.uid, title: c.title, reason: 'Building not on our map' }); return }
          counts[await save({ ...c, room: c.room ?? ev.room }, ev.building_code)]++
        }
      }))
    }
  } catch (e) { error = e.message }
  skipped = skipped.slice(0, 200)
  await rpc('sync_finish', { p_admin: admin, p_run: run, p_error: error, p_skipped: skipped,
    p_counts: { fetched: picked.inWindow, new: counts.new, updated: counts.updated, skipped: skipped.length, feed_status: feed.status } })
  return { run, error, feed_status: feed.status, in_window: picked.inWindow, ...counts, skipped: skipped.length }
}

export default async function handler(req, res) {
  let admin = req.body?.admin
  if (req.method === 'GET') { // Vercel cron
    const ok = process.env.CRON_SECRET && req.headers?.authorization === `Bearer ${process.env.CRON_SECRET}`
    if (!ok) return res.status(401).json({ error: 'unauthorized' })
    admin = process.env.ADMIN_SYNC_KEY
  } else if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!/^[0-9a-f-]{36}$/i.test(String(admin ?? ''))) return res.status(401).json({ error: 'Enter a valid admin key.' })
  try { res.status(200).json(await runSync(admin)) }
  catch (e) { res.status(/admin/.test(e.message) ? 401 : /already running/.test(e.message) ? 409 : 500).json({ error: e.message }) }
}
