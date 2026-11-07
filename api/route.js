// POST {from:[lng,lat], to:[lng,lat], profile} -> {coords, distance, duration, steps}
// Proxies OpenRouteService so the key stays server-side. Locations are never logged or stored.
import { CAMPUS, meters } from '../src/lib/geo.js'

const PROFILES = new Set(['foot-walking', 'wheelchair'])
// shortcut: per-instance memory cache; ORS free quota is ~200/day. Move to a KV store if traffic grows.
const cache = new Map()

const valid = (p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite) &&
  meters(CAMPUS, { lng: p[0], lat: p[1] }) < 5000

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const { from, to, profile = 'foot-walking' } = req.body || {}
  if (!valid(from) || !valid(to) || !PROFILES.has(profile)) return res.status(400).json({ error: 'Route must start and end near campus' })

  const key = [...from, ...to].map((n) => n.toFixed(4)).join(',') + profile
  if (cache.has(key)) return res.status(200).json(cache.get(key))

  const r = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
    method: 'POST',
    headers: { Authorization: process.env.ORS_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates: [from, to], instructions: true }),
  })
  if (!r.ok) return res.status(502).json({ error: r.status === 429 ? 'Routing quota used up'
    : profile === 'wheelchair' ? 'No step-free route found in map data' : 'No route found' })
  const f = (await r.json()).features?.[0]
  if (!f) return res.status(502).json({ error: 'No route found' })
  const coords = f.geometry.coordinates
  const out = {
    coords,
    distance: f.properties.summary.distance ?? 0,
    duration: f.properties.summary.duration ?? 0,
    steps: f.properties.segments.flatMap((s) => s.steps).map((s) => ({
      text: s.instruction, distance: s.distance, at: coords[s.way_points[0]],
    })),
  }
  cache.set(key, out)
  res.status(200).json(out)
}
