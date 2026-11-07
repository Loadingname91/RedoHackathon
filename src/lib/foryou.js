// "For you" ranking. Runs on this phone only: your interests and schedule are never sent anywhere.
import { isNow, endOf, fit } from './geo.js'

export const INTERESTS = ['Games', 'Pizza', 'Music', 'Coding', 'Hiking', 'Art', 'Film', 'Skiing']
const WORD = { food: 'food', swag: 'swag', music: 'music', games: 'games', speaker: 'talks', workshop: 'workshops', prizes: 'prizes', networking: 'meetups' }

// Score 0–100 plus up to 3 plain reasons. weights = affinity.json "weights" (learned by scripts/train-foryou.mjs).
export function scoreEvent(e, { interests = [], weights = {}, freeUntil = null, count = 0, now = new Date() }) {
  if (!e.start_at || endOf(e) <= now) return null
  const reasons = []
  let s = 50

  // Taste: sum of learned interest×offering weights for offerings that aren't finished.
  let taste = 0, best = null
  for (const o of e.offerings ?? []) {
    if (o.status === 'finished') continue
    for (const i of interests) {
      const w = weights[i]?.[o.type] ?? 0
      taste += w
      if (w > 0.15 && (!best || w > best.w)) best = { w, i, o: o.type }
    }
  }
  s += Math.max(-30, Math.min(30, taste * 25))
  if (best) reasons.push(`${best.i} fans rate ${WORD[best.o] ?? best.o} highly`)

  // Timing: on now or starting soon beats tomorrow.
  const mins = (new Date(e.start_at) - now) / 60000
  if (isNow(e, now)) { s += 12; reasons.push('On now') }
  else if (mins < 120) { s += 8; reasons.push(`Starts in ${Math.round(mins)} min`) }
  else if (mins > 24 * 60) s -= 10

  // Schedule fit (only when you've set "free until").
  const f = fit(e, freeUntil, now)
  if (f === 'fits') { s += 15; reasons.push('Fits your gap') }
  if (f === 'clashes') s -= 35

  if ((e.offerings ?? []).some((o) => o.status === 'running_low')) reasons.push('Something is running low, go soon')
  if (count >= 3) { s += 5; reasons.push(`${count} people here`) }

  return { score: Math.round(Math.max(0, Math.min(100, s))), reasons: reasons.slice(0, 3) }
}

// Events best-first; ended events are dropped.
export function rankEvents(events, opts, counts = {}) {
  return events
    .map((e) => ({ e, r: scoreEvent(e, { ...opts, count: counts[e.id] ?? 0 }) }))
    .filter((x) => x.r)
    .sort((a, b) => b.r.score - a.r.score)
}
