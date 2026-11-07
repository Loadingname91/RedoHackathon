// Campus Connect iCal feed: fetch, filter to placeable in-person events, rule-based building/room/offering matching.
// Shared by api/sync.js and scripts/seed.mjs. (Files starting with _ are not Vercel routes.)
import ICAL from 'ical.js'
import fs from 'node:fs'

export const FEED_URL = 'https://campusconnect.utah.edu/ical/utah/ical_utah.ics'
const UA = 'ConstellationU-campus-sync/0.1 (University of Utah student hackathon project)'
const SKIP_RE = /online|zoom|virtual|asia campus|test event|check-?in\b|check out/i

export function loadBuildings() {
  try { const b = JSON.parse(fs.readFileSync(new URL('../src/data/buildings.json', import.meta.url), 'utf8')); return Array.isArray(b) ? b : b.buildings ?? [] }
  catch { return [] }
}

export async function fetchFeed() {
  const r = await fetch(FEED_URL, { redirect: 'follow', headers: { 'User-Agent': UA } })
  if (!r.ok) return { status: r.status, events: [] }
  const comp = new ICAL.Component(ICAL.parse(await r.text()))
  return { status: r.status, events: comp.getAllSubcomponents('vevent').map((v) => new ICAL.Event(v)) }
}

// Longest building name found in the text wins ("Warnock Engineering Building" beats "Warnock").
export function matchBuilding(text, buildings) {
  const t = ` ${String(text ?? '').toLowerCase()} `
  let best = null, len = 0
  for (const b of buildings) for (const n of b.names ?? []) {
    const name = n.toLowerCase()
    if (name.length < 3 || name.length <= len) continue
    const re = new RegExp(`[^a-z0-9]${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^a-z0-9]`)
    if (re.test(t)) { best = b.code; len = name.length }
  }
  return best
}

// "WEB 1230", "Room 210", "#1-100". Ignores street numbers ("200 S Central Campus Dr").
export function matchRoom(location) {
  const s = String(location ?? '')
  return s.match(/(?:room|rm\.?|#)\s*([\w-]+)/i)?.[1]
    ?? s.match(/\b([A-Z]?\d{3,4}[A-Z]?)\b(?!\s*(?:S|E|N|W|South|East|North|West)\b)/)?.[1] ?? null
}

const OFFER = [['food', /pizza|food|snack|refreshment|lunch|dinner|breakfast|treat|ice cream|cookie|donut|coffee|tacos?\b/i],
  ['swag', /swag|sticker|t-?shirt|merch/i], ['music', /music|concert|\bdj\b|band\b/i], ['games', /game|trivia|bingo/i],
  ['speaker', /speaker|keynote|guest lecture|panel/i], ['workshop', /workshop|hands-on|bootcamp/i],
  ['prizes', /prize|raffle|giveaway/i], ['networking', /networking|mixer|meet and greet/i]]
export function matchOfferings(text) {
  return OFFER.filter(([, re]) => re.test(text)).map(([type, re]) => ({ type, text: String(text).match(re)[0].toLowerCase(), status: 'advertised' }))
}

const key = (e) => e.uid + (e.recurrenceId ? `|${e.recurrenceId.toString()}` : '')

// Next `days` days of in-person events. Returns {candidates, skipped}; each skip has a plain-English reason.
export function pickEvents(events, buildings, { days = 7, now = Date.now() } = {}) {
  const end = now + days * 864e5, seenTitles = new Set(), skipped = [], candidates = []
  const inWindow = events.filter((e) => { const t = e.startDate?.toJSDate().getTime(); return t > now && t < end })
    .sort((a, b) => a.startDate.toJSDate() - b.startDate.toJSDate())
  for (const e of inWindow) {
    const title = String(e.summary ?? '').trim(), loc = String(e.location ?? '')
    const skip = (reason) => skipped.push({ uid: key(e), title, reason, location: loc.slice(0, 120) })
    if (!title) { skip('No title'); continue }
    if (SKIP_RE.test(`${title} ${loc}`)) { skip('Online, desk hours or test listing'); continue }
    if (seenTitles.has(title.toLowerCase())) { skip('Later repeat of an event already listed'); continue }
    seenTitles.add(title.toLowerCase())
    if (/sign in to download/i.test(loc) && !matchBuilding(e.description, buildings)) { skip('Location hidden on Campus Connect'); continue }
    const desc = String(e.description ?? '')
    const building = matchBuilding(loc, buildings) ?? matchBuilding(desc, buildings)
    candidates.push({
      uid: key(e), title, building, room: building ? matchRoom(loc) : null,
      start_at: e.startDate.toJSDate().toISOString(), end_at: e.endDate?.toJSDate().toISOString() ?? null,
      host: String(e.component.getFirstProperty('organizer')?.getParameter('cn') ?? '').slice(0, 120) || null, // name only, never the email
      offerings: matchOfferings(`${title} ${desc}`),
      source_url: e.component.getFirstPropertyValue('url') ?? null,
      text: [title, `When: ${e.startDate.toJSDate().toLocaleString('en-US', { timeZone: 'America/Denver' })}`, `Where: ${loc}`, desc.slice(0, 2500)].join('\n'),
    })
  }
  return { candidates, skipped, inWindow: inWindow.length }
}
