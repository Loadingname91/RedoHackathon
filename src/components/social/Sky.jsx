import React from 'react'
import { components, confirmedEdges } from '../../lib/social.js'
import './social.css'

// The 4-point sparkle star from the design. Half variants are used on the match/prompt screens.
export const SPARK = 'M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z'
export const HALF_R = 'M12 2l2.2 7.8L22 12l-7.8 2.2L12 22z'
export const HALF_L = 'M12 2L9.8 9.8L2 12l7.8 2.2L12 22z'
export const StarIcon = ({ size = 20, fill = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d={SPARK} fill={fill} /></svg>
)

// Groups people: mine first, then other connected groups, then singles. Positions are orbit slots, not where people stand.
export function arrange(people, connections, meId, w, h) {
  const groups = components(people.map((p) => p.id), confirmedEdges(connections))
    .sort((a, b) => (b.includes(meId) - a.includes(meId)) || b.length - a.length)
  const order = groups.flat()
  const kind = Object.fromEntries(groups.flatMap((g) => g.map((id) => [id, g.includes(meId) && g.length > 1 ? 'mine' : g.length > 1 ? 'group' : 'single'])))
  const n = Math.max(order.length, 1)
  const R1 = Math.min(w, h) * 0.24, R2 = Math.min(w, h) * 0.4
  const pos = Object.fromEntries(order.map((id, i) => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 ? R1 : R2
    return [id, { x: w / 2 + Math.cos(ang) * r, y: h / 2 + Math.sin(ang) * r }]
  }))
  return { pos, kind, groups, R1, R2 }
}

// One event's sky: planet in the middle, dashed orbits, stars with nicknames, confirmed lines.
// Never renders clues. With onSelect, each star is a real button (44 px hit area).
export default function Sky({ people, connections, constellations = [], meId, w = 360, h = 340, big = false, onSelect }) {
  const { pos, kind, groups, R1, R2 } = arrange(people, connections, meId, w, h)
  const lines = connections.filter((c) => c.a_confirmed && c.b_confirmed && pos[c.a] && pos[c.b])
  const named = constellations.map((c) => {
    const pts = c.members.map((id) => pos[id]).filter(Boolean)
    if (!pts.length) return null
    const x = pts.reduce((s, p) => s + p.x, 0) / pts.length, y = Math.max(...pts.map((p) => p.y))
    return { id: c.id, name: c.name, x, y, mine: c.members.includes(meId) }
  }).filter(Boolean)
  const pct = (v, of) => `${(v / of) * 100}%`
  const scale = big ? 1.6 : 1
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: `${w} / ${h}` }}
      role="img" aria-label={`${people.length} people in this sky, ${lines.length} connections, ${groups.filter((g) => g.length > 1).length} groups`}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <defs><filter id="cu-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter></defs>
        <circle cx={w / 2} cy={h / 2} r={R1} fill="none" stroke="#2C3660" strokeDasharray="3 6" />
        <circle cx={w / 2} cy={h / 2} r={R2} fill="none" stroke="#2C3660" strokeDasharray="3 6" />
        {lines.map((c) => {
          const mine = kind[c.a] === 'mine'
          return <line key={c.id} className="cu-draw" x1={pos[c.a].x} y1={pos[c.a].y} x2={pos[c.b].x} y2={pos[c.b].y}
            stroke={mine ? '#FFE2A3' : '#9DB8FF'} strokeOpacity={mine ? 1 : 0.85} strokeWidth={(mine ? 2 : 1.4) * scale} strokeLinecap="round"
            style={mine ? { filter: 'drop-shadow(0 0 6px #F5C76B)' } : undefined} />
        })}
        {/* the event planet */}
        <circle cx={w / 2} cy={h / 2} r={18 * scale} fill="#18214A" stroke="#FF5A5A" strokeWidth={2.5} />
        <circle cx={w / 2} cy={h / 2} r={7 * scale} fill="#FFE2A3" opacity=".8" />
      </svg>
      {people.map((p, i) => {
        const at = pos[p.id]; if (!at) return null
        const me = p.id === meId, k = kind[p.id]
        const z = (me ? 28 : k === 'single' ? 13 : 18) * scale
        const fill = me ? '#FFF3D6' : k === 'mine' ? '#FFE2A3' : k === 'group' ? 'none' : '#E9ECF8'
        const stroke = k === 'group' ? '#9DB8FF' : 'none'
        const label = me ? `${p.nickname} (you)` : p.nickname
        const body = (
          <>
            <span style={{ position: 'relative', width: Math.max(z, 30), height: Math.max(z, 30), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {me && <span className="cu-ringanim" style={{ position: 'absolute', inset: 2, borderRadius: '50%', border: '2px solid #FFE2A3' }} />}
              <svg className={me ? '' : 'cu-tw'} width={z} height={z} viewBox="0 0 24 24" aria-hidden="true"
                style={{ animationDelay: `${(i * 0.37) % 2.4}s`, filter: me || k === 'mine' ? 'drop-shadow(0 0 8px #F5C76B)' : undefined }}>
                <path d={SPARK} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </span>
            <span style={{ font: `${me ? 700 : 500} ${big ? 17 : 11}px Inter, sans-serif`, color: me ? '#FFE2A3' : '#C9D0EC', whiteSpace: 'nowrap' }}>{label}</span>
          </>
        )
        const style = { position: 'absolute', left: pct(at.x, w), top: pct(at.y, h), transform: 'translate(-50%, -22px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }
        return onSelect
          ? <button key={p.id} onClick={() => onSelect(p)} aria-label={`${label}. Options`}
              style={{ ...style, minWidth: 44, minHeight: 44, padding: 0, background: 'none', border: 0, borderRadius: 12 }}>{body}</button>
          : <div key={p.id} style={style}>{body}</div>
      })}
      {named.map((c) => (
        <div key={c.id} style={{ position: 'absolute', left: pct(c.x, w), top: pct(Math.min(c.y + 34 * scale, h - 10), h), transform: 'translateX(-50%)',
          padding: big ? '8px 14px' : '3px 8px', borderRadius: 12, background: 'rgba(42,42,62,.85)', border: `1px solid ${c.mine ? '#F5C76B' : '#9DB8FF'}`,
          font: `600 ${big ? 15 : 11}px Inter, sans-serif`, color: c.mine ? '#FFE9BE' : '#CFDDFF', whiteSpace: 'nowrap' }}>{c.name}</div>
      ))}
    </div>
  )
}
