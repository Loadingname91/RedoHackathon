// Geometry + time helpers shared by the map, navigation and api/route.js.
export const CAMPUS = { lat: 40.7655, lng: -111.8440 }

// Distance in meters between {lat,lng} points.
export function meters(a, b) {
  const R = 6371000, rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Shortest distance (m) from point p to a polyline of [lng,lat] coords. Fine at campus scale (equirectangular).
export function distanceToLine(p, coords) {
  const k = Math.cos(p.lat * Math.PI / 180) * 111320, m = 110540
  let best = Infinity
  for (let i = 0; i < coords.length - 1; i++) {
    const ax = (coords[i][0] - p.lng) * k, ay = (coords[i][1] - p.lat) * m
    const bx = (coords[i + 1][0] - p.lng) * k, by = (coords[i + 1][1] - p.lat) * m
    const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy
    const t = len ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len)) : 0
    best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy))
  }
  return best
}

const TZ = 'America/Denver'
export const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }) : 'Time unknown'
export const fmtDay = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric' }) : ''
export const fmtRange = (e) => `${fmtDay(e.start_at)} · ${fmtTime(e.start_at)}${e.end_at ? '–' + fmtTime(e.end_at) : ''}`

// shortcut: events without end_at are treated as 2 h long; good enough for "now" and fit checks.
export const endOf = (e) => e.end_at ? new Date(e.end_at) : new Date(new Date(e.start_at).getTime() + 2 * 3600e3)
export const isNow = (e, now = new Date()) => e.start_at && new Date(e.start_at) <= now && endOf(e) > now
export const isLaterToday = (e, now = new Date()) => {
  if (!e.start_at) return false
  const s = new Date(e.start_at), day = (d) => d.toLocaleDateString('en-US', { timeZone: TZ })
  return s > now && day(s) === day(now)
}

// Schedule fit against "free until" (ISO string). Returns 'fits' | 'clashes' | null (no schedule set).
export function fit(e, freeUntil, now = new Date()) {
  if (!freeUntil || !e.start_at) return null
  const until = new Date(freeUntil)
  if (until <= now) return null
  const start = new Date(e.start_at)
  if (endOf(e) <= now) return null
  return start < until ? 'fits' : 'clashes'
}

export const fmtDuration = (s) => `${Math.max(1, Math.round(s / 60))} min`
export const fmtDistance = (m) => m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`

// Card/sheet time line in the design's words: "Now · until 8:30 PM", "Tonight, 9:00 PM", else day + time.
export function whenText(e, now = new Date()) {
  if (!e.start_at) return 'Time on the announcement'
  if (isNow(e, now)) return e.end_at ? `Now · until ${fmtTime(e.end_at)}` : 'Now'
  if (isLaterToday(e, now)) return `${new Date(e.start_at).getHours() >= 17 ? 'Tonight' : 'Today'}, ${fmtTime(e.start_at)}`
  return fmtRange(e)
}
