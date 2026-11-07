// Pure layout for an event sky (no React, no Supabase), so it can be checked with node.

// Groups people joined by confirmed connections. Returns arrays of participant ids.
export function components(ids, edges) {
  const parent = new Map(ids.map((id) => [id, id]))
  const find = (x) => (parent.get(x) === x ? x : (parent.set(x, find(parent.get(x))), parent.get(x)))
  for (const [a, b] of edges) if (parent.has(a) && parent.has(b)) parent.set(find(a), find(b))
  const groups = new Map()
  for (const id of ids) { const r = find(id); groups.set(r, [...(groups.get(r) ?? []), id]) }
  return [...groups.values()]
}

export const confirmedEdges = (connections) =>
  connections.filter((c) => c.a_confirmed && c.b_confirmed).map((c) => [c.a, c.b])

export const segmentsCross = (p, q, r, s) => {
  const o = (a, b, c) => Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x))
  return o(p, q, r) * o(p, q, s) < 0 && o(r, s, p) * o(r, s, q) < 0
}

// Count crossings among edges that share no endpoint.
export function crossings(edges, pos) {
  let n = 0
  for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
    const [a, b] = edges[i], [c, d] = edges[j]
    if (a !== c && a !== d && b !== c && b !== d && segmentsCross(pos[a], pos[b], pos[c], pos[d])) n++
  }
  return n
}

// Order a group around its circle by depth-first walk. Trees and simple loops never cross this way;
// we try each member as the start and keep the order with fewest crossings (only dense groups like
// "all four know each other" can still cross, and on a circle that can't be avoided).
function circleOrder(group, edges, meId) {
  const adj = new Map(group.map((id) => [id, []]))
  for (const [a, b] of edges) if (adj.has(a) && adj.has(b)) { adj.get(a).push(b); adj.get(b).push(a) }
  const walk = (start) => {
    const seen = new Set(), out = []
    const go = (id) => { seen.add(id); out.push(id); for (const n of adj.get(id)) if (!seen.has(n)) go(n) }
    go(start)
    return out
  }
  const ring = (order) => Object.fromEntries(order.map((id, i) => {
    const a = (i / order.length) * Math.PI * 2
    return [id, { x: Math.cos(a), y: Math.sin(a) }]
  }))
  const own = edges.filter(([a]) => adj.has(a))
  const starts = group.includes(meId) ? [meId, ...group.filter((id) => id !== meId)] : group
  let best = null, bestX = Infinity
  for (const s of starts.slice(0, 12)) { // shortcut: tries 12 starts max; enough for room-sized groups
    const order = walk(s), x = crossings(own, ring(order))
    if (x < bestX) { best = order; bestX = x }
    if (!x) break
  }
  return best
}

// Each connected group sits in its own small circle; groups and singles are laid around the planet
// in rings, never overlapping, so lines from different groups can't cross. A crowded sky shrinks to fit
// (`fit` < 1) instead of piling stars on top of each other.
// `gap` is the spacing between neighbouring stars and `hub` the planet's clear radius, both in px.
export function arrange(people, connections, meId, w, h, { gap = 52, hub = 40 } = {}) {
  const edges = confirmedEdges(connections)
  const groups = components(people.map((p) => p.id), edges)
    .sort((a, b) => (b.includes(meId) - a.includes(meId)) || b.length - a.length)
  const kind = Object.fromEntries(groups.flatMap((g) => g.map((id) => [id, g.includes(meId) && g.length > 1 ? 'mine' : g.length > 1 ? 'group' : 'single'])))

  // Disc per group: members on a circle with neighbours `gap` apart, plus half a gap of margin.
  const discs = groups.map((g) => {
    const r = g.length > 1 ? gap / (2 * Math.sin(Math.PI / g.length)) : 0
    return { ids: g.length > 1 ? circleOrder(g, edges, meId) : g, r, D: r + gap / 2 }
  })

  // Fill rings outward. A disc of radius D on a ring of radius R takes 2·asin(D/R) of angle,
  // which keeps neighbouring discs from touching.
  const rings = []
  let R = 0, cur = null
  for (const d of discs) {
    const take = (rad) => 2 * Math.asin(Math.min(1, d.D / rad))
    if (!cur || cur.used + take(cur.R) > Math.PI * 2) {
      R = cur ? cur.R + cur.maxD + d.D : hub + d.D
      cur = { R, used: 0, maxD: 0, items: [] }
      rings.push(cur)
    }
    const a = take(cur.R)
    cur.items.push({ d, a }); cur.used += a; cur.maxD = Math.max(cur.maxD, d.D)
  }

  const extent = rings.length ? Math.max(...rings.map((g) => g.R + g.maxD)) : 1
  const margin = gap * 0.6 // room for the nickname under the bottom stars
  const fit = Math.min(1, (w / 2 - margin) / extent, (h / 2 - margin) / extent)

  const pos = {}
  for (const ring of rings) {
    const slack = (Math.PI * 2 - ring.used) / ring.items.length // spread spare angle evenly
    let ang = -Math.PI / 2 - ring.items[0].a / 2
    for (const { d, a } of ring.items) {
      const mid = ang + a / 2
      const cx = Math.cos(mid) * ring.R, cy = Math.sin(mid) * ring.R
      d.ids.forEach((id, i) => {
        const u = (i / d.ids.length) * Math.PI * 2 + mid // face the group's first member toward the planet's far side
        pos[id] = { x: w / 2 + (cx + Math.cos(u) * d.r) * fit, y: h / 2 + (cy + Math.sin(u) * d.r) * fit }
      })
      ang += a + slack
    }
  }
  const orbits = rings.length ? rings.slice(0, 2).map((g) => g.R * fit) : [Math.min(w, h) * 0.24, Math.min(w, h) * 0.4]
  return { pos, kind, groups, orbits, fit }
}
